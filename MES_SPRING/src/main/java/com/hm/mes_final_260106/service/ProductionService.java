package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.dto.*;
import com.hm.mes_final_260106.entity.*;
import com.hm.mes_final_260106.exception.CustomException;
import com.hm.mes_final_260106.mapper.Mapper;
import com.hm.mes_final_260106.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductionService {

    private final ProductionLogRepository logRepo;
    private final MaterialRepository matRepo;
    private final WorkOrderRepository orderRepo;
    private final BomRepository bomRepo;
    private final ProductRepository productRepo;
    private final LotRepository lotRepo;
    private final LotMappingRepository lotMappingRepo;
    private final EquipmentRepository equipmentRepo;

    // ✅ Worker 분리 후: memberRepo / passwordEncoder / Authority 사용 X (Worker CRUD에서 제거)
    private final WorkerRepository workerRepo;

    private final DicingRepository dicingRepo;
    private final DicingInspectionRepository dicingInspectionRepo;
    private final DieBondingRepository dieBondingRepo;
    private final DieBondingInspectionRepository dieBondingInspectionRepo;
    private final WireBondingRepository wireBondingRepo;
    private final WireBondingInspectionRepository wireBondingInspectionRepo;
    private final MoldingRepository moldingRepo;
    private final MoldingInspectionRepository moldingInspectionRepo;
    private final ItemRepository itemRepo;
    private final FinalInspectionLogRepository finalInspectionLRepo;
    private final ProductionResultRepository productionResultRepo;

    private final InspectionStandardRepository standardRepo;
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
    public WorkOrder createWorkOrder(String productCode, int targetQty, String targetLine) {

        Product product = productRepo.findByCode(productCode)
                .orElseThrow(() -> new RuntimeException("품목을 찾을 수 없습니다"));

        WorkOrder order = WorkOrder.builder()
                .workOrderNumber(generateWorkOrderNumber())
                .product(product)
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

        if (!"RELEASED".equals(order.getStatus())) {
            throw new RuntimeException("RELEASED 상태에서만 Start 할 수 있습니다. 현재 상태: " + order.getStatus());
        }

        order.setStatus("IN_PROGRESS");
        order.setAssignedMachineId(machineId);

        return orderRepo.save(order);
    }

    // ============================
    // 작업지시 Finish (IN_PROGRESS -> COMPLETED)
    // ============================
    @Transactional
    public WorkOrder finishWorkOrder(Long orderId) {
        WorkOrder order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("작업 지시를 찾을 수 없습니다. ID: " + orderId));

        if (!"IN_PROGRESS".equals(order.getStatus())) {
            throw new RuntimeException("IN_PROGRESS 상태에서만 Finish 할 수 있습니다. 현재 상태: " + order.getStatus());
        }

        order.setStatus("COMPLETED");
        order.setEndDate(LocalDateTime.now());

        return orderRepo.save(order);
    }

    // 작업지시 로그 기록 (이벤트)
    @Transactional
    public void createEventLog(ProductionLogEventReqDto dto) {
        String level = "INFO";
        String message = "";

        if ("START".equals(dto.getActionType())) {
            level = "INFO";
            message = "작업을 시작했습니다";
        } else if ("PAUSE".equals(dto.getActionType())) {
            level = "WARN";
            message = "작업중단사유를 작성해주세요";
        } else if ("FINISH".equals(dto.getActionType())) {
            level = "INFO";
            message = "작업이 완료되었습니다";
        }

        WorkOrder workOrder = orderRepo.findById(dto.getWorkOrderId())
                .orElseThrow(() -> new RuntimeException("WorkOrder not found"));

        ProductionLog log = ProductionLog.builder()
                .workOrder(workOrder)
                .level(level)
                .category("PRODUCTION")
                .message(message)
                .startTime(LocalDateTime.now())
                .resultDate(LocalDate.now())
                .resultQty(0)
                .status(com.hm.mes_final_260106.constant.ProductionStatus.RUN)
                .build();

        logRepo.save(log);
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
    public WorkOrder updateWorkOrder(Long id, String productCode, int targetQty, String targetLine) {

        WorkOrder order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("작업 지시를 찾을 수 없습니다. ID: " + id));

        Product product = productRepo.findByCode(productCode)
                .orElseThrow(() -> new RuntimeException("품목을 찾을 수 없습니다"));

        if ("IN_PROGRESS".equals(order.getStatus()) || "COMPLETED".equals(order.getStatus())) {
            throw new RuntimeException("진행중/완료된 작업은 수정할 수 없습니다.");
        }

        order.setProduct(product);
        order.setTargetQty(targetQty);
        order.setTargetLine(targetLine);

        return orderRepo.save(order);
    }

    @Transactional
    public WorkOrder updateWorkOrderStatus(Long id, String status) {

        WorkOrder order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("작업 지시를 찾을 수 없습니다. ID: " + id));

        if (status == null) throw new RuntimeException("status는 필수입니다.");

        String next = status.trim().toUpperCase();

        if (!next.equals("WAITING") &&
                !next.equals("RELEASED") &&
                !next.equals("IN_PROGRESS") &&
                !next.equals("PAUSED") &&
                !next.equals("COMPLETED")) {
            throw new RuntimeException("허용되지 않는 status: " + next);
        }

        String current = order.getStatus();

        boolean allowed =
                ("WAITING".equals(current) && "IN_PROGRESS".equals(next)) ||
                        ("WAITING".equals(current) && "RELEASED".equals(next)) ||
                        ("RELEASED".equals(current) && "IN_PROGRESS".equals(next)) ||
                        ("IN_PROGRESS".equals(current) && "PAUSED".equals(next)) ||
                        ("PAUSED".equals(current) && "IN_PROGRESS".equals(next)) ||
                        ("IN_PROGRESS".equals(current) && "COMPLETED".equals(next)) ||
                        ("PAUSED".equals(current) && "COMPLETED".equals(next));

        if (!allowed) {
            throw new RuntimeException("허용되지 않는 상태 변경입니다. (" + current + " -> " + next + ")");
        }

        order.setStatus(next);

        if ("IN_PROGRESS".equals(next) && order.getStartDate() == null) {
            order.setStartDate(LocalDateTime.now());
        }

        if ("COMPLETED".equals(next)) {
            order.setEndDate(LocalDateTime.now());
        }

        return orderRepo.save(order);
    }

    // =========================
    // 6) 설비 작업 할당 (C# 폴링)
    // =========================
    @Transactional
    public WorkOrder assignWorkToMachine(String machineId) {

        WorkOrder current = orderRepo.findByStatusAndAssignedMachineId("IN_PROGRESS", machineId).orElse(null);
        if (current != null) return current;

        WorkOrder waiting = orderRepo.findFirstByStatusOrderByIdAsc("RELEASED").orElse(null);
        if (waiting == null) return null;

        waiting.setStatus("IN_PROGRESS");
        waiting.setAssignedMachineId(machineId);

        return orderRepo.save(waiting);
    }

    // =========================
    // 7) 생산 실적 보고
    // =========================
    @Transactional
    public void reportProduction(ProductionReportDto dto) {
        log.info("reportProduction 실행 : {}", dto.getWorkOrderId());
        log.info("itemDtos : {}", dto.getItemDtos());
        log.info("inputLots : {}", dto.getInputLots());

        Long orderId = dto.getWorkOrderId();

        WorkOrder workOrder = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("작업 지시를 찾을 수 없습니다. ID: " + orderId));

        Product product = workOrder.getProduct();

        Equipment equipment = equipmentRepo.findByCode(dto.getEquipmentCode())
                .orElseThrow(() -> new RuntimeException("설비를 찾을 수 없습니다"));

        // ✅ Worker 분리 후: 작업자 지정은 workerId로 받는 게 정석
        // dto에 workerId가 없다면 DTO부터 추가해야 함.
        Worker worker = null;
        if (dto.getWorkerId() != null) {
            worker = workerRepo.findById(dto.getWorkerId())
                    .orElseThrow(() -> new RuntimeException("작업자를 찾을 수 없습니다. id=" + dto.getWorkerId()));
        }

        ProductionLog productionLog = mapper.toEntity(dto);
        productionLog.setWorkOrder(workOrder);
        productionLog.setEquipment(equipment);

        // ✅ 여기 중요:
        // 기존 ProductionLog가 member 필드를 갖고 있으면, 분리 설계에서는 worker로 바꿔야 함.
        // 1) ProductionLog에 worker 필드를 추가한 경우:
        // productionLog.setWorker(worker);
        // 2) 아직 ProductionLog가 member만 있다면, 일단 null로 두고 추후 마이그레이션:
        // productionLog.setMember(null);
        //
        // 아래는 1) worker 필드를 추가했다고 가정한 코드야.
        if (worker != null) {
            productionLog.setWorker(worker);
        }

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

        List<Item> items = new ArrayList<>();
        List<FinalInspection> finalInspections = new ArrayList<>();

        for (int i = 0; i < dto.getItemDtos().size(); i++) {
            Item item = mapper.toEntity(dto.getItemDtos().get(i));
            item.setProductionLog(productionLog);
            item.setProduct(product);
            items.add(item);

            FinalInspection finalInspection = mapper.toEntity(dto.getFinalInspectionDtos().get(i));
            finalInspection.setProductionLog(productionLog);
            finalInspection.setItem(item);
            finalInspections.add(finalInspection);
        }

        List<Lot> lots = new ArrayList<>();
        List<LotMapping> lotMappings = new ArrayList<>();

        for (String lotCode : dto.getInputLots()) {
            Lot lot = lotRepo.findByCode(lotCode)
                    .orElseThrow(() -> new RuntimeException("LOT를 찾을 수 없습니다. Code: " + lotCode));
            lot.setStatus("소모됨");
            lots.add(lot);

            LotMapping lotMapping = new LotMapping();
            lotMapping.setProductionLog(productionLog);
            lotMapping.setLot(lot);
            lotMappings.add(lotMapping);
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
        items = itemRepo.saveAll(items);
        finalInspections = finalInspectionLRepo.saveAll(finalInspections);
        lots = lotRepo.saveAll(lots);
        lotMappings = lotMappingRepo.saveAll(lotMappings);

        Bom bom = bomRepo.findById(product.getId())
                .orElseThrow(() -> new EntityNotFoundException("BOM을 찾을 수 없습니다"));

        for (BomItem bomItem : bom.getItems()) {
            Material mat = bomItem.getMaterial();
            int required = bomItem.getRequiredQty();
            int current = mat.getCurrentStock();

            if (current < required) {
                throw new CustomException("SHORTAGE", "MATERIAL_SHORTAGE:" + mat.getName());
            }

            mat.setCurrentStock(current - required);
            log.info("[Backflushing] 자재: {}, 차감후 재고: {}", mat.getName(), mat.getCurrentStock());
        }

        workOrder.setCurrentQty(workOrder.getCurrentQty() + 1);

        if (workOrder.getCurrentQty() >= workOrder.getTargetQty()) {
            workOrder.setStatus("COMPLETED");
            workOrder.setEndDate(LocalDateTime.now());
        }

        log.info("[생산 보고] 제품:{} 상태:{} 수량:{}/{}",
                workOrder.getProduct().getCode(), workOrder.getStatus(),
                workOrder.getCurrentQty(), workOrder.getTargetQty());

        orderRepo.save(workOrder);
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

    private String generateWorkOrderNumber() {
        String date = LocalDate.now().toString().replace("-", "");
        int random = (int) (Math.random() * 9000) + 1000;
        return "WO-" + date + "-" + random;
    }

    // 생산실적현황 서비스
    @Transactional(readOnly = true)
    public PerformanceSummaryResDto getPerformanceSummary(LocalDate date, String line) {
        PerformanceSummaryResDto dto = productionResultRepo.getSummary(date, line);
        if (dto == null) return new PerformanceSummaryResDto(0L, 0L, 0L, 0.0);
        return dto;
    }

    @Transactional(readOnly = true)
    public List<HourlyPerformanceResDto> getHourlyPerformance(LocalDate date, String line) {
        List<Object[]> results = productionResultRepo.getHourlyNative(date, line);

        return results.stream()
                .map(result -> new HourlyPerformanceResDto(
                        (String) result[0],
                        ((Number) result[1]).longValue(),
                        ((Number) result[2]).longValue(),
                        ((Number) result[3]).longValue()
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkOrderPerformanceResDto> getWorkOrderPerformanceList(LocalDate date, String line) {

        List<WorkOrder> orders = orderRepo.findByLineForPerformance(line);

        return orders.stream().map(wo -> {
            long plan = (long) wo.getTargetQty();
            long actual = (long) wo.getCurrentQty();
            long loss = Math.max(plan - actual, 0L);
            double rate = (plan == 0L) ? 0.0 : (actual * 100.0 / plan);
            String status = "IN_PROGRESS".equals(wo.getStatus()) ? "RUNNING" : wo.getStatus();

            return new WorkOrderPerformanceResDto(
                    wo.getWorkOrderNumber(),
                    wo.getProduct().getCode(),
                    wo.getTargetLine(),
                    "wfrs",
                    plan,
                    actual,
                    loss,
                    rate,
                    status
            );
        }).toList();
    }

    // =========================
    // 이벤트 로그 저장
    // =========================
    public void saveEventLog(EventLogReqDto dto) {

        ProductionLog log = ProductionLog.builder()
                .startTime(LocalDateTime.now())
                .level(dto.getLevel())
                .category("PRODUCTION")
                .message(dto.getMessage())
                .build();

        logRepo.save(log);
    }

    // =========================
    // 이벤트 로그 조회
    // =========================
    @Transactional(readOnly = true)
    public List<EventLogResDto> getEventLogs() {
        return logRepo
                .findByMessageIsNotNullOrderByStartTimeDesc()
                .stream()
                .map(EventLogResDto::from)
                .toList();
    }




    // 이벤트 로그 메시지 수정
    @Transactional
    public void updateMessage(Long id, String message) {
        ProductionLog log = logRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Log not found"));
        log.setMessage(message);
    }

    // =========================
    // 작업자 조회
    // =========================
    @Transactional(readOnly = true)
    public List<WorkerResDto> getAllWorkers() {
        return workerRepo.findAll().stream()
                .map(WorkerResDto::fromEntity) // WorkerResDto도 member 기반이면 수정 필요
                .toList();
    }

    // =========================
    // 작업자 등록 (Member 생성 로직 제거)
    // =========================
    @Transactional
    public WorkerResDto registerWorker(WorkerCreateReqDto dto) {

        // ✅ Worker 분리 후: email/password/authority 같은 계정정보는 Worker가 들지 않음
        // ✅ WorkerCreateReqDto는 name/shift/status/dept/joinDate/certifications만 갖도록 수정 권장

        String certStr = (dto.getCertifications() == null || dto.getCertifications().isEmpty())
                ? ""
                : String.join(",", dto.getCertifications());

        Worker worker = Worker.builder()
                .name(dto.getName()) // ✅ name 필수 (Worker에 name 컬럼 있어야 함)
                .dept(dto.getDept() == null ? "TBD" : dto.getDept())
                .shift(dto.getShift() == null ? "Day" : dto.getShift())
                .status(dto.getStatus() == null ? "OFF" : dto.getStatus())
                .joinDate(dto.getJoinDate() == null ? LocalDate.now() : dto.getJoinDate())
                .certifications(certStr)
                .build();

        Worker savedWorker = workerRepo.save(worker);
        return WorkerResDto.fromEntity(savedWorker);
    }

    // =========================
    // 작업자 수정 (Member 수정 로직 제거)
    // =========================
    @Transactional
    public WorkerResDto updateWorker(Long workerId, WorkerUpdateReqDto dto) {

        Worker worker = workerRepo.findById(workerId)
                .orElseThrow(() -> new RuntimeException("작업자를 찾을 수 없습니다. id=" + workerId));

        if (dto.getName() != null) worker.setName(dto.getName());
        if (dto.getDept() != null) worker.setDept(dto.getDept());
        if (dto.getShift() != null) worker.setShift(dto.getShift());
        if (dto.getStatus() != null) worker.setStatus(dto.getStatus());

        if (dto.getCertifications() != null) {
            worker.setCertifications(String.join(",", dto.getCertifications()));
        }

        Worker saved = workerRepo.save(worker);
        return WorkerResDto.fromEntity(saved);
    }

    // =========================
    // 작업자 삭제
    // =========================
    @Transactional
    public void deleteWorker(Long workerId) {
        Worker worker = workerRepo.findById(workerId)
                .orElseThrow(() -> new RuntimeException("작업자를 찾을 수 없습니다. id=" + workerId));
        workerRepo.delete(worker);
    }

    // ==========================================
    // 기준 정보 조회
    // ==========================================
    public List<Equipment> getAllEquipments() {
        return equipmentRepo.findAll();
    }

    public List<Material> getAllMaterials() {
        return matRepo.findAll();
    }

    public List<Product> getAllProducts() {
        return productRepo.findAll();
    }

    // ==========================================
    // 품질(Quality) 및 BOM API 로직
    // ==========================================
    public List<Bom> getAllBoms() {
        return bomRepo.findAll();
    }

    public List<FinalInspection> getAllDefectLogs() {
        return finalInspectionLRepo.findAll();
    }

    public List<DieBonding> getAllDieBondingLogs() {
        return dieBondingRepo.findAll();
    }

    public List<Molding> getAllMoldingLogs() {
        return moldingRepo.findAll();
    }

    // ==========================================
    // 실시간 실적 집계 (Dashboard용)
    // ==========================================
    private void updateProductionResult(WorkOrder order, Product product, int goodQty, int defectQty) {
        LocalDate today = LocalDate.now();
        int currentHour = LocalDateTime.now().getHour();
        String line = order.getTargetLine();

        ProductionResult result = productionResultRepo
                .findByResultDateAndResultHourAndLineAndProduct(today, currentHour, line, product)
                .orElseGet(() -> {
                    ProductionResult newResult = new ProductionResult();
                    newResult.setResultDate(today);
                    newResult.setResultHour(currentHour);
                    newResult.setLine(line);
                    newResult.setProduct(product);
                    newResult.setPlanQty(0);
                    newResult.setGoodQty(0);
                    newResult.setDefectQty(0);
                    newResult.setCreatedAt(LocalDateTime.now());
                    return newResult;
                });

        result.setGoodQty(result.getGoodQty() + goodQty);
        result.setDefectQty(result.getDefectQty() + defectQty);

        productionResultRepo.save(result);
    }

    // ==========================================
    // 품질 검사 기준 조회 (Quality Standard)
    // ==========================================
    public List<InspectionStandard> getInspectionStandards(String processName) {
        if (standardRepo.count() == 0) {
            standardRepo.save(InspectionStandard.builder().processName("DieBonding").checkItem("Bonding Temp").lsl(150.0).usl(180.0).unit("°C").description("접합 온도 기준").build());
            standardRepo.save(InspectionStandard.builder().processName("WireBonding").checkItem("Tensile Strength").lsl(50.0).usl(100.0).unit("N").description("와이어 인장 강도").build());
            standardRepo.save(InspectionStandard.builder().processName("Molding").checkItem("Pressure").lsl(10.0).usl(20.0).unit("Bar").description("몰딩 압력 기준").build());
        }

        if (processName == null || "ALL".equals(processName)) return standardRepo.findAll();
        return standardRepo.findByProcessName(processName);
    }
}
