package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.entity.Bom;
import com.hm.mes_final_260106.entity.Material;
import com.hm.mes_final_260106.entity.ProductionLog;
import com.hm.mes_final_260106.entity.WorkOrder;
import com.hm.mes_final_260106.exception.CustomException;
import com.hm.mes_final_260106.repository.BomRepository;
import com.hm.mes_final_260106.repository.MaterialRepository;
import com.hm.mes_final_260106.repository.ProductionLogRepository;
import com.hm.mes_final_260106.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sound.sampled.TargetDataLine;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductionService {

    private final ProductionLogRepository logRepo;
    private final MaterialRepository matRepo;
    private final WorkOrderRepository orderRepo;
    private final BomRepository bomRepo;

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
    public void reportProduction(Long orderId, String machineId, String result, String defectCode) {

        WorkOrder order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("작업 지시를 찾을 수 없습니다. ID: " + orderId));

        if ("COMPLETED".equals(order.getStatus())) return;

        // 생산 이력 저장
        String serialNo = generateSerial(order.getProductId());

        logRepo.save(ProductionLog.builder()
                .workOrderNo(order.getWorkorder_number())   // 작업지시번호
                .productCode(order.getProductId())          // productId를 productCode 자리에 기록 (현재 엔티티 구조 유지)
                .machineId(machineId)
                .serialNo(serialNo)
                .result(result)
                .defectCode("NG".equals(result) ? defectCode : null)
                .producedAt(LocalDateTime.now())
                .build());

        // 자재 차감 (양품일 때만)
        if ("OK".equals(result)) {
            List<Bom> boms = bomRepo.findAllByProductCode(order.getProductId());

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
}
