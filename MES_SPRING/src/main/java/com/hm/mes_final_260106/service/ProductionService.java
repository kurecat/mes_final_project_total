package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.dto.PerformanceSummaryResDto;
import com.hm.mes_final_260106.entity.Bom;
import com.hm.mes_final_260106.entity.Material;
import com.hm.mes_final_260106.entity.ProductionLog;
import com.hm.mes_final_260106.entity.WorkOrder;
import com.hm.mes_final_260106.dto.FinalInspectionDto;
import com.hm.mes_final_260106.dto.ProductionReportDto;
import com.hm.mes_final_260106.entity.*;
import com.hm.mes_final_260106.exception.CustomException;
import com.hm.mes_final_260106.repository.*;
import com.hm.mes_final_260106.mapper.Mapper;
import com.hm.mes_final_260106.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sound.sampled.TargetDataLine;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductionService {

    private final ProductionLogRepository logRepo;
    private final MaterialRepository matRepo;
    private final WorkOrderRepository orderRepo;
    private final BomRepository bomRepo;

    private final DicingRepository dicingRepo;
    private final DicingInspectionRepository dicingInspectionRepo;
    private final DieBondingRepository dieBondingRepo;
    private final DieBondingInspectionRepository dieBondingInspectionRepo;
    private final WireBondingRepository wireBondingRepo;
    private final WireBondingInspectionRepository wireBondingInspectionRepo;
    private final MoldingRepository moldingRepo;
    private final MoldingInspectionRepository moldingInspectionRepo;
    private final FinalInspectionLogRepository finalInspectionLogRepo;

    private final Mapper mapper;

    // =========================
    // 1) 자재 입고
    // =========================
    @Transactional
    public Material inboundMaterial(String code, String name, int amount) {

        Material material = matRepo.findByCode(code)
                .orElse(Material.builder()
                        .code(code)
                        .name(name)
                        .currentStock(0)
                        .build());

        material.setCurrentStock(material.getCurrentStock() + amount);
        return matRepo.save(material);
    }

    // =========================
    // 2) 작업 지시 생성
    // =========================
    @Transactional
    public WorkOrder createWorkOrder(String productId, int targetQty, String targetLine) {

        WorkOrder order = WorkOrder.builder()
                .workorder_number(generateWorkOrderNumber())
                .productId(productId)
                .targetQty(targetQty)
                .currentQty(0)
                .status("WAITING")
                .targetLine(targetLine)
                .build();

        return orderRepo.save(order);
    }

    // =========================
    // 3) 작업지시 Release (WAITING -> RELEASED)
    // =========================
    @Transactional
    public WorkOrder releaseWorkOrder(Long orderId) {

        WorkOrder order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("작업 지시를 찾을 수 없습니다. ID: " + orderId));

        if ("COMPLETED".equals(order.getStatus())) {
            throw new RuntimeException("완료된 작업은 Release 할 수 없습니다.");
        }

        if ("WAITING".equals(order.getStatus())) {
            order.setStatus("RELEASED");
        }

        return orderRepo.save(order);
    }

    // ============================
    // 작업지시 Start (RELEASED -> IN_PROGRESS)
    // ============================
    @Transactional
    public WorkOrder startWorkOrder(Long orderId, String machineId) {
        WorkOrder order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("작업 지시를 찾을 수 없습니다. ID: " + orderId));

        // 정책: RELEASED만 시작 가능
        if (!"RELEASED".equals(order.getStatus())) {
            throw new RuntimeException("RELEASED 상태에서만 Start 할 수 있습니다. 현재 상태: " + order.getStatus());
        }

        order.setStatus("IN_PROGRESS");
        order.setAssignedMachineId(machineId); // 더미/선택값

        // start_date는 PrePersist로 생성되지만
        // 실제 시작시간을 따로 두고 싶으면 start_date 대신 run_start_date를 분리하는게 정석
        // 지금은 구조 유지

        return orderRepo.save(order);
    }

    // ============================
    // 작업지시 Finish (IN_PROGRESS -> COMPLETED)
    // ============================
    @Transactional
    public WorkOrder finishWorkOrder(Long orderId) {
        WorkOrder order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("작업 지시를 찾을 수 없습니다. ID: " + orderId));

        // 정책: IN_PROGRESS만 완료 가능
        if (!"IN_PROGRESS".equals(order.getStatus())) {
            throw new RuntimeException("IN_PROGRESS 상태에서만 Finish 할 수 있습니다. 현재 상태: " + order.getStatus());
        }

        order.setStatus("COMPLETED");
        order.setEnd_date(LocalDateTime.now());

        return orderRepo.save(order);
    }

    // =========================
    // 4) 작업지시 삭제
    // =========================
    @Transactional
    public void deleteWorkOrder(Long orderId) {

        WorkOrder order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("작업 지시를 찾을 수 없습니다. ID: " + orderId));

        if ("IN_PROGRESS".equals(order.getStatus()) || "COMPLETED".equals(order.getStatus())) {
            throw new RuntimeException("진행중/완료된 작업은 삭제할 수 없습니다.");
        }

        orderRepo.delete(order);
    }

    // =========================
    // 5) 작업지시 수정
    // =========================
    @Transactional
    public WorkOrder updateWorkOrder(Long id, String productId, int targetQty,String targetLine) {

        WorkOrder order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("작업 지시를 찾을 수 없습니다. ID: " + id));

        if ("IN_PROGRESS".equals(order.getStatus()) || "COMPLETED".equals(order.getStatus())) {
            throw new RuntimeException("진행중/완료된 작업은 수정할 수 없습니다.");
        }

        order.setProductId(productId);
        order.setTargetQty(targetQty);
        order.setTargetLine(targetLine);

        return orderRepo.save(order);
    }

    @Transactional
    public WorkOrder updateWorkOrderStatus(Long id, String status) {

        WorkOrder order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("작업 지시를 찾을 수 없습니다. ID: " + id));

        if (status == null) {
            throw new RuntimeException("status는 필수입니다.");
        }

        String next = status.trim().toUpperCase();
        // 완료 상태는 변경 불가
        if (!next.equals("WAITING") &&
                !next.equals("RELEASED") &&
                !next.equals("IN_PROGRESS") &&
                !next.equals("PAUSED") &&
                !next.equals("COMPLETED")) {
            throw new RuntimeException("허용되지 않는 status: " + next);
        }

        String current = order.getStatus();

        // 상태 전이 정책(정석)
        boolean allowed =
                ("RELEASED".equals(current) && "IN_PROGRESS".equals(status)) || // Start
                        ("IN_PROGRESS".equals(current) && "PAUSED".equals(status)) ||   // Pause
                        ("PAUSED".equals(current) && "IN_PROGRESS".equals(status)) ||   // Resume
                        ("IN_PROGRESS".equals(current) && "COMPLETED".equals(status)) || // Finish
                        ("PAUSED".equals(current) && "COMPLETED".equals(status)); // Finish

        if (!allowed) {
            throw new RuntimeException("허용되지 않는 상태 변경입니다. (" + current + " -> " + status + ")");
        }

        order.setStatus(status);

        // 시작/종료 시간 기록
        if ("IN_PROGRESS".equals(status) && order.getStart_date() == null) {
            order.setStart_date(LocalDateTime.now()); // ⭐
        }

        if ("COMPLETED".equals(status)) {
            order.setEnd_date(LocalDateTime.now()); // ⭐
        }

        return orderRepo.save(order);
    }

    // =========================
    // 6) 설비 작업 할당 (C# 폴링)
    // RELEASED -> IN_PROGRESS
    // =========================
    @Transactional
    public WorkOrder assignWorkToMachine(String machineId) {

        // 이미 이 설비에 진행중 작업이 있으면 그 작업 반환
        WorkOrder current = orderRepo.findByStatusAndAssignedMachineId("IN_PROGRESS", machineId).orElse(null);
        if (current != null) return current;

        // RELEASED 상태인 가장 오래된 작업지시를 할당
        WorkOrder waiting = orderRepo.findFirstByStatusOrderByIdAsc("RELEASED").orElse(null);
        if (waiting == null) return null;

        waiting.setStatus("IN_PROGRESS");
        waiting.setAssignedMachineId(machineId);

        return orderRepo.save(waiting);
    }

    // =========================
    // 7) 생산 실적 보고
    // (로그 저장 + BOM 차감 + 수량 증가 + 완료 처리)
    // =========================
    @Transactional
    public void reportProduction(ProductionReportDto dto) {

        Long orderId = dto.getWorkOrderId();

        // 지시 정보 확인
        WorkOrder order = orderRepo.findById(orderId).
                orElseThrow(() -> new RuntimeException("작업 지시를 찾을 수 없습니다. ID: " + orderId));

        ProductionLog productionLog = mapper.toEntity(dto);

        Dicing dicing = mapper.toEntity(dto.getDicingDto());
        dicing.setProductionLog(productionLog);

        DicingInspection dicingInspection = mapper.toEntity(dto.getDicingInspectionDto());
        dicingInspection.setDicing(dicing);

        DieBonding dieBonding = mapper.toEntity(dto.getDieBondingDto());
        dieBonding.setProductionLog(productionLog);

        DieBondingInspection dieBondingInspection = mapper.toEntity(dto.getDieBondingInspectionDto());
        dieBondingInspection.setDieBonding(dieBonding);

        WireBonding wireBonding = mapper.toEntity(dto.getWireBondingDto());
        wireBonding.setProductionLog(productionLog);

        WireBondingInspection wireBondingInspection = mapper.toEntity(dto.getWireBondingInspectionDto());
        wireBondingInspection.setWireBonding(wireBonding);

        Molding molding = mapper.toEntity(dto.getMoldingDto());
        molding.setProductionLog(productionLog);

        MoldingInspection moldingInspection = mapper.toEntity(dto.getMoldingInspectionDto());
        moldingInspection.setMolding(molding);

        List<FinalInspection> finalInspections = new ArrayList<>();
        for (FinalInspectionDto inspDto : dto.getFinalInspectionDtos()) {
            FinalInspection finalInspection = mapper.toEntity(inspDto);
            finalInspection.setProductionLog(productionLog);
            finalInspections.add(finalInspection);
        }

        productionLog = logRepo.save(productionLog);
        dicing = dicingRepo.save(dicing);
        dicingInspection = dicingInspectionRepo.save(dicingInspection);
        dieBonding = dieBondingRepo.save(dieBonding);
        dieBondingInspection = dieBondingInspectionRepo.save(dieBondingInspection);
        wireBonding = wireBondingRepo.save(wireBonding);
        wireBondingInspection = wireBondingInspectionRepo.save(wireBondingInspection);
        molding = moldingRepo.save(molding);
        moldingInspection = moldingInspectionRepo.save(moldingInspection);
        finalInspections = finalInspectionLogRepo.saveAll(finalInspections);

        if (true) {
            List<Bom> boms = bomRepo.findAllByProductId(order.getProductId());
            for (Bom bom : boms) {
                Material mat = bom.getMaterial();
                int required = bom.getRequiredQty();
                int current = mat.getCurrentStock();

                if (current < required) {
                    throw new CustomException("SHORTAGE", "MATERIAL_SHORTAGE:" + mat.getName());
                }

                mat.setCurrentStock(current - required);
                log.info("[Backflushing] 자재: {}, 차감후 재고: {}", mat.getName(), mat.getCurrentStock());
            }
        } else {
            log.info("생산 불량(NG) -> 자재 차감 하지 않음");
        }

        // 수량 증가
        order.setCurrentQty(order.getCurrentQty() + 1);

        // 완료 처리
        if (order.getCurrentQty() >= order.getTargetQty()) {
            order.setStatus("COMPLETED");
            order.setEnd_date(LocalDateTime.now()); // 생산 마감 시점 기록
        }

        log.info("[생산 보고] 제품:{} 상태:{} 수량:{}/{}",
                order.getProductId(), order.getStatus(), order.getCurrentQty(), order.getTargetQty());

        orderRepo.save(order);
    }

    // =========================
    // 8) 작업 지시 전체 목록 조회
    // =========================
    public List<WorkOrder> getAllWorkOrders() {
        return orderRepo.findAllByOrderByIdDesc();
    }

    // =========================
    // 9) 전체 자재 재고량
    // =========================
    public List<Material> getMaterialStock() {
        return matRepo.findAll();
    }

    // =========================
    // util) 작업지시 번호 생성
    // =========================
    private String generateWorkOrderNumber() {
        // 예: WO-20260116-1234
        String date = LocalDate.now().toString().replace("-", "");
        int random = (int) (Math.random() * 9000) + 1000;
        return "WO-" + date + "-" + random;
    }

    // =========================
    // util) 시리얼 번호 생성
    // =========================
    private String generateSerial(String productId) {
        return productId + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    @Transactional(readOnly = true)
    public PerformanceSummaryResDto getPerformanceSummary(LocalDate date, String line) {

        // ✅ 수정: Repository에서 DTO를 바로 받으므로 캐스팅/배열처리 하면 안됨
        PerformanceSummaryResDto dto = productionResultRepository.getSummary(date, line);

        // ✅ 추가: 혹시 null 방어 (데이터 없을 때)
        if (dto == null) {
            return new PerformanceSummaryResDto(0L, 0L, 0L, 0.0);
        }

        return dto;
    }



}
