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

        // ▼ [추가] LazyInitializationException 방지: Product 정보 강제 로드
        if (order.getProduct() != null) {
            order.getProduct().getName();
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

        // 이미 IN_PROGRESS 상태라면 에러 없이 바로 리턴 (중복 클릭 방지)
        if ("IN_PROGRESS".equals(order.getStatus())) {
            // Lazy Init 방지용 초기화 후 리턴
            if (order.getProduct() != null) order.getProduct().getName();
            return order;
        }

        if (!"RELEASED".equals(order.getStatus())) {
            throw new RuntimeException("RELEASED 상태에서만 Start 할 수 있습니다. 현재 상태: " + order.getStatus());
        }

        order.setStatus("IN_PROGRESS");
        order.setAssignedMachineId(machineId);

        // 시작 시간 기록 (없을 경우)
        if (order.getStartDate() == null) {
            order.setStartDate(LocalDateTime.now());
        }

        // ▼ [추가] LazyInitializationException 방지
        if (order.getProduct() != null) {
            order.getProduct().getName();
        }

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

        // ▼ [추가] LazyInitializationException 방지
        if (order.getProduct() != null) {
            order.getProduct().getName();
        }

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
        String current = order.getStatus();

        // (기존) 같은 상태면 return
        if (current.equals(next)) {
            if (order.getProduct() != null) order.getProduct().getName();
            return order;
        }

        // (기존) allowed 검증...
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

        // ✅ [추가] 상태 변경 전/후 로깅을 위해 current를 보존해둠 (이미 위에 있음)
        order.setStatus(next);

        // ✅ [추가] 여기서 로그 1건 저장 (추가 최소 핵심)
        writeWorkOrderStatusChangeLog(order, current, next);

        if ("IN_PROGRESS".equals(next) && order.getStartDate() == null) {
            order.setStartDate(LocalDateTime.now());
        }

        if ("COMPLETED".equals(next)) {
            order.setEndDate(LocalDateTime.now());
        }

        if (order.getProduct() != null) {
            order.getProduct().getName();
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
        Long orderId = dto.getWorkOrderId();

        WorkOrder workOrder = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("작업 지시를 찾을 수 없습니다. ID: " + orderId));

        Product product = workOrder.getProduct();
        Equipment equipment = equipmentRepo.findByCode(dto.getEquipmentCode())
                .orElseThrow(() -> new RuntimeException("설비를 찾을 수 없습니다"));

        Worker worker = null;
        if (dto.getWorkerId() != null) {
            worker = workerRepo.findById(dto.getWorkerId())
                    .orElseThrow(() -> new RuntimeException("작업자를 찾을 수 없습니다. id=" + dto.getWorkerId()));
        }

        ProductionLog productionLog = mapper.toEntity(dto);
        productionLog.setWorkOrder(workOrder);
        productionLog.setEquipment(equipment);
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

        logRepo.save(productionLog);
        dicingRepo.save(dicing);
        dicingInspectionRepo.save(dicingInspection);
        dieBondingRepo.save(dieBonding);
        dieBondingInspectionRepo.save(dieBondingInspection);
        wireBondingRepo.save(wireBonding);
        wireBondingInspectionRepo.save(wireBondingInspection);
        moldingRepo.save(molding);
        moldingInspectionRepo.save(moldingInspection);
        itemRepo.saveAll(items);
        finalInspectionLRepo.saveAll(finalInspections);
        lotRepo.saveAll(lots);
        lotMappingRepo.saveAll(lotMappings);

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
        }

        workOrder.setCurrentQty(workOrder.getCurrentQty() + 1);

        if (workOrder.getCurrentQty() >= workOrder.getTargetQty()) {
            workOrder.setStatus("COMPLETED");
            workOrder.setEndDate(LocalDateTime.now());
        }

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
    // 이벤트 로그 저장 / 조회 / 수정
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

    @Transactional(readOnly = true)
    public List<EventLogResDto> getEventLogs() {
        return logRepo
                .findByMessageIsNotNullOrderByStartTimeDesc()
                .stream()
                .map(EventLogResDto::from)
                .toList();
    }

    @Transactional
    public void updateMessage(Long id, String message) {
        ProductionLog log = logRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Log not found"));
        log.setMessage(message);
    }

    // ✅ 작업지시 상태 변경 시 ProductionLog(이벤트 로그) 1건 저장
    private void writeWorkOrderStatusChangeLog(WorkOrder order, String from, String to) {
        String level = "INFO";
        if ("PAUSED".equals(to)) level = "WARN";

        String msg = "작업지시 상태 변경: " + from + " → " + to;

        ProductionLog log = ProductionLog.builder()
                .workOrder(order)
                .level(level)
                .category("PRODUCTION")
                .message(msg)
                .startTime(LocalDateTime.now())
                .resultDate(LocalDate.now())
                .resultQty(0)
                // ✅ 기존 코드와 동일하게 RUN로 두면 안전 (enum mismatch 방지)
                .status(com.hm.mes_final_260106.constant.ProductionStatus.RUN)
                .build();

        logRepo.save(log);
    }


    // =========================
    // 작업자 조회 / 등록 / 수정 / 삭제
    // =========================
    @Transactional(readOnly = true)
    public List<WorkerResDto> getAllWorkers() {
        return workerRepo.findAll().stream()
                .map(WorkerResDto::fromEntity)
                .toList();
    }

    @Transactional
    public WorkerResDto registerWorker(WorkerCreateReqDto dto) {
        String certStr = (dto.getCertifications() == null || dto.getCertifications().isEmpty())
                ? ""
                : String.join(",", dto.getCertifications());

        Worker worker = Worker.builder()
                .name(dto.getName())
                .dept(dto.getDept() == null ? "TBD" : dto.getDept())
                .shift(dto.getShift() == null ? "Day" : dto.getShift())
                .status(dto.getStatus() == null ? "OFF" : dto.getStatus())
                .joinDate(dto.getJoinDate() == null ? LocalDate.now() : dto.getJoinDate())
                .certifications(certStr)
                .build();

        Worker savedWorker = workerRepo.save(worker);
        return WorkerResDto.fromEntity(savedWorker);
    }

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

    @Transactional
    public void deleteWorker(Long workerId) {
        Worker worker = workerRepo.findById(workerId)
                .orElseThrow(() -> new RuntimeException("작업자를 찾을 수 없습니다. id=" + workerId));
        workerRepo.delete(worker);
    }

    // ==========================================
    // 기준 정보 및 품질 조회
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