package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.constant.MaterialTxType;
import com.hm.mes_final_260106.constant.ProductionStatus;
import com.hm.mes_final_260106.dto.*;
import com.hm.mes_final_260106.dto.lot.LotHistoryResDto;
import com.hm.mes_final_260106.dto.lot.LotResDto;
import com.hm.mes_final_260106.dto.worker.WorkerResDto;
import com.hm.mes_final_260106.entity.*;
import com.hm.mes_final_260106.exception.CustomException;
import com.hm.mes_final_260106.mapper.ProductionLogMapper;
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

    private final ProductionLogRepository productionLogRepo;
    private final MaterialRepository matRepo;
    private final WorkOrderRepository orderRepo;
    private final BomRepository bomRepo;
    private final ProductRepository productRepo;
    private final LotRepository lotRepo;
    private final LotMappingRepository lotMappingRepo;
    private final EquipmentRepository equipmentRepo;
    private final WorkerRepository workerRepo;
    private final MaterialTransactionRepository materialTxRepo;

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
    private final ProductionLogMapper productionLogMapper;

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

        // ✅ WAITING -> RELEASED 전환 시점에만 plan_qty 누적 (중복 Release 방지)
        boolean releasedNow = "WAITING".equals(order.getStatus());
        if (releasedNow) {
            order.setStatus("RELEASED");

            // 🔥 Release 시점에 production_result.plan_qty 증가
            LocalDate today = LocalDate.now();
            int hour = LocalDateTime.now().getHour();
            String line = (order.getTargetLine() == null || order.getTargetLine().isBlank())
                    ? "Fab-Line-A"
                    : order.getTargetLine();

            ProductionResult pr = productionResultRepo
                    .findByResultDateAndResultHourAndLineAndProduct(today, hour, line, order.getProduct())
                    .orElseGet(() -> {
                        ProductionResult created = new ProductionResult();
                        created.setResultDate(today);
                        created.setResultHour(hour);
                        created.setLine(line);
                        created.setProduct(order.getProduct());
                        created.setPlanQty(0);
                        created.setGoodQty(0);
                        created.setDefectQty(0);
                        created.setCreatedAt(LocalDateTime.now());
                        return created;
                    });

            int basePlan = (pr.getPlanQty() == null) ? 0 : pr.getPlanQty();
            pr.setPlanQty(basePlan + order.getTargetQty());

            // (안전) null 방지
            if (pr.getGoodQty() == null) pr.setGoodQty(0);
            if (pr.getDefectQty() == null) pr.setDefectQty(0);

            productionResultRepo.save(pr);
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
                .orElseThrow(() ->
                        new RuntimeException("작업 지시를 찾을 수 없습니다. ID: " + orderId)
                );

        String status = order.getStatus();

        // 🔒 이미 작업중이면 조용히 리턴 (중복 클릭 방지)
        if ("IN_PROGRESS".equals(status)) {
            if (order.getProduct() != null) {
                order.getProduct().getName();
            }
            return order;
        }

        // ❌ Release 안 된 경우 → 시작 차단 + 메시지
        if (!"RELEASED".equals(status)) {
            throw new RuntimeException("Release가 적용이 되지 않았습니다.");
        }

        // ▶ 정상 Start
        order.setStatus("IN_PROGRESS");
        order.setAssignedMachineId(machineId);

        if (order.getStartDate() == null) {
            order.setStartDate(LocalDateTime.now());
        }

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
        // 기본 메시지 설정 (프론트에서 온 게 없으면 기본값 사용)
        String message = (dto.getMessage() != null) ? dto.getMessage() : "";

        if ("START".equals(dto.getActionType())) {
            level = "INFO";
            if(message.isEmpty()) message = "작업을 시작했습니다";
        } else if ("PAUSE".equals(dto.getActionType())) {
            level = "WARN";
            // 프론트에서 보낸 pauseReason이 여기 dto.getMessage()로 들어옵니다.
            if(message.isEmpty()) message = "작업 중단";
        } else if ("FINISH".equals(dto.getActionType())) {
            level = "INFO";
            if(message.isEmpty()) message = "작업이 완료되었습니다";
        }

        WorkOrder workOrder = orderRepo.findById(dto.getWorkOrderId())
                .orElseThrow(() -> new RuntimeException("WorkOrder not found"));

        ProductionLog log = ProductionLog.builder()
                .workOrder(workOrder)
                .level(level)
                .category("PRODUCTION")
                .message(message) // ⭐ 이 부분이 DB의 message 컬럼으로 들어갑니다.
                .startTime(LocalDateTime.now())
                .resultDate(LocalDate.now())
                .resultQty(0)
                .status(com.hm.mes_final_260106.constant.ProductionStatus.RUN)
                .build();

        productionLogRepo.save(log);
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

        // 1. (기존) 같은 상태면 return
        if (current.equals(next)) {
            if (order.getProduct() != null) order.getProduct().getName();
            return order;
        }

        // 2. (기존) 비즈니스 제약 조건 검증
        if ("WAITING".equals(current) && "IN_PROGRESS".equals(next)) {
            throw new RuntimeException("Release가 되지 않은 작업지시입니다.");
        }

        // 3. (기존) 상태 변경 허용 여부 검증
        boolean allowed =
                ("WAITING".equals(current) && "RELEASED".equals(next)) ||
                        ("RELEASED".equals(current) && "IN_PROGRESS".equals(next)) ||
                        ("IN_PROGRESS".equals(current) && "PAUSED".equals(next)) ||
                        ("PAUSED".equals(current) && "IN_PROGRESS".equals(next)) ||
                        ("IN_PROGRESS".equals(current) && "COMPLETED".equals(next)) ||
                        ("PAUSED".equals(current) && "COMPLETED".equals(next));

        if (!allowed) {
            throw new RuntimeException("허용되지 않는 상태 변경입니다. (" + current + " -> " + next + ")");
        }

        // ✨ [신규 추가] 작업 시작/재개 시 재고 체크 로직
        // IN_PROGRESS로 가려고 할 때 재고가 부족하면 CustomException을 던지고 상태를 PAUSED로 유지합니다.
//        if ("IN_PROGRESS".equals(next)) {
//            validateInventoryAndFillShortage(order);
//        }

        // 4. (기존) 상태 업데이트 및 로그 저장
        order.setStatus(next);
        writeWorkOrderStatusChangeLog(order, current, next);

        // ✨ [신규 추가] 정상적으로 상태가 변경될 때(특히 재고 문제가 해결되었을 때) 부족 정보 초기화
        if (!"PAUSED".equals(next)) {
            order.setShortageMaterialName(null);
            order.setShortageQty(0);
        }

        // 5. (기존) 시간 기록 로직
        if ("IN_PROGRESS".equals(next) && order.getStartDate() == null) {
            order.setStartDate(LocalDateTime.now());
        }

        if ("COMPLETED".equals(next)) {
            order.setEndDate(LocalDateTime.now());
        }

        // Lazy Loading 방지 (기존 유지)
        if (order.getProduct() != null) {
            order.getProduct().getName();
        }

        return orderRepo.save(order);
    }

    /**
     * ✨ [신규 메서드] BOM 기반 재고 검증 및 부족 정보 엔티티 기록
     */
    private void validateInventoryAndFillShortage(WorkOrder order) {
        // 해당 제품의 BOM 조회
        Bom bom = bomRepo.findById(order.getProduct().getId())
                .orElseThrow(() -> new RuntimeException("해당 제품의 BOM 설정이 없습니다."));

        for (BomItem bomItem : bom.getItems()) {
            Material mat = bomItem.getMaterial();
            int required = bomItem.getRequiredQty(); // 작업당 필요 수량 (로직에 따라 targetQty와 곱하기 가능)
            int currentStock = mat.getCurrentStock();

            if (currentStock < required) {
                int shortage = required - currentStock;

                // 엔티티 필드에 부족 정보 저장 (프론트 5초 주기 폴링 시 감지됨)
                order.setShortageMaterialName(mat.getName());
                order.setShortageQty(shortage);
                order.setStatus("PAUSED"); // 상태를 PAUSED로 강제 설정
                orderRepo.save(order);

                // 프론트엔드 catch 문에서 인식할 수 있도록 예외 발생
                // CustomException이 없다면 RuntimeException에 특정 문구를 포함시키세요.
                throw new CustomException("INVENTORY_SHORTAGE", mat.getName() + ":" + shortage);
            }
        }
    }


    // =========================
    // 6) 설비 작업 할당 (C# 폴링)
    // =========================
    @Transactional
    public WorkOrderResDto assignWorkToMachine(String equipmentCode) {
        WorkOrder current = orderRepo.findByStatusAndAssignedMachineId("IN_PROGRESS", equipmentCode).orElse(null);
        if (current != null) {
            log.info("작업지시 보유 중 : {}", current);
            return WorkOrderResDto.fromEntity(current);
        }

        WorkOrder waiting = orderRepo.findFirstByStatusAndAssignedMachineIdIsNullOrderByIdAsc("IN_PROGRESS").orElse(null);
        if (waiting == null) {
            log.info("대기중인 작업 없음");
            return null;
        }

        waiting.setAssignedMachineId(equipmentCode);
        waiting = orderRepo.save(waiting);
        log.info("작업지시 할당 : {}", waiting);
        return WorkOrderResDto.fromEntity(waiting);
    }

    // =========================
    // 7) 생산 실적 보고
    // =========================
    @Transactional(noRollbackFor = CustomException.class)
    public void reportProduction(ProductionLogDto dto) {
        log.info("reportProduction 실행 : {}", dto.getWorkOrderNumber());

        WorkOrder workOrder = orderRepo.findByWorkOrderNumber(dto.getWorkOrderNumber())
                .orElseThrow(() -> new RuntimeException("작업 지시를 찾을 수 없습니다. 번호 : " + dto.getWorkOrderNumber()));

        Product product = workOrder.getProduct();
        Equipment equipment = equipmentRepo.findByCode(dto.getEquipmentCode())
                .orElseThrow(() -> new RuntimeException("설비를 찾을 수 없습니다"));

        Worker worker = null;
        if (dto.getWorkerCode() != null) {
            worker = workerRepo.findByCode(dto.getWorkerCode())
                    .orElseThrow(() -> new RuntimeException("작업자를 찾을 수 없습니다. id=" + dto.getWorkerCode()));
        }

        ProductionLog productionLog = productionLogMapper.toEntity(dto);
        productionLog.setWorkOrder(workOrder);
        productionLog.setEquipment(equipment);
        productionLog.setWorker(worker);


        Dicing dicing = productionLogMapper.toEntity(dto.getDicingDto(), productionLog);
        DicingInspection dicingInspection = productionLogMapper.toEntity(dto.getDicingInspectionDto(), dicing);

        DieBonding dieBonding = productionLogMapper.toEntity(dto.getDieBondingDto(), productionLog);
        DieBondingInspection dieBondingInspection = productionLogMapper.toEntity(dto.getDieBondingInspectionDto(), dieBonding);

        WireBonding wireBonding = productionLogMapper.toEntity(dto.getWireBondingDto(), productionLog);
        WireBondingInspection wireBondingInspection = productionLogMapper.toEntity(dto.getWireBondingInspectionDto(), wireBonding);

        Molding molding = productionLogMapper.toEntity(dto.getMoldingDto(), productionLog);
        MoldingInspection moldingInspection = productionLogMapper.toEntity(dto.getMoldingInspectionDto(), molding);


        List<Item> items = new ArrayList<>();
        List<FinalInspection> finalInspections = new ArrayList<>();

        for (int i = 0; i < dto.getItemDtos().size(); i++) {
            Item item = productionLogMapper.toEntity(dto.getItemDtos().get(i), productionLog, product);
            items.add(item);

            FinalInspection fi = productionLogMapper.toEntity(dto.getFinalInspectionDtos().get(i), productionLog, item);
            finalInspections.add(fi);
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

        productionLogRepo.save(productionLog);
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


        // 자재 차감
        Bom bom = bomRepo.findById(product.getId())
                .orElseThrow(() -> new EntityNotFoundException("BOM을 찾을 수 없습니다"));

        // =========================================================
        // 🔥 BOM 기준 자재 체크 / 차감
        // =========================================================
        for (BomItem bomItem : bom.getItems()) {
            Material mat = bomItem.getMaterial();

            int bomPerUnit = bomItem.getRequiredQty(); // 200
            int currentStock = mat.getCurrentStock();

            // =================================================
            // 1️⃣ 자재 부족 → 즉시 PAUSE
            // =================================================
            if (currentStock < bomPerUnit) {

                int remainingQty = workOrder.getTargetQty() - workOrder.getCurrentQty(); // 98
                int requiredTotal = remainingQty * bomPerUnit;                            // 98 * 200
                int shortageForDisplay = requiredTotal - currentStock;

                workOrder.setStatus("PAUSED");
                workOrder.setShortageMaterialName(mat.getName());
                workOrder.setShortageQty(shortageForDisplay);
                orderRepo.saveAndFlush(workOrder);

                ProductionLog autoLog = ProductionLog.builder()
                        .workOrder(workOrder)
                        .level("WARN")
                        .category("PRODUCTION")
                        .message("*** [" + mat.getName() + "] 재고가 부족합니다 (부족분: " + requiredTotal + ", 보유: " + currentStock + ")")
                        .startTime(LocalDateTime.now())
                        .resultDate(LocalDate.now())
                        .resultQty(0)
                        .status(ProductionStatus.PAUSED)
                        .build();
                productionLogRepo.save(autoLog);

                throw new CustomException("INVENTORY_SHORTAGE", mat.getName() + ":" + shortageForDisplay);
            }

            // =================================================
            // 2️⃣ 정상 자재 차감
            // =================================================
            int afterStock = currentStock - bomPerUnit;
            mat.setCurrentStock(afterStock);
            matRepo.save(mat);

            MaterialTransaction outboundTx = MaterialTransaction.builder()
                    .type(MaterialTxType.OUTBOUND)
                    .material(mat)
                    .qty(bomPerUnit) // 🔧 [수정] 남은 생산 기준
                    .unit("ea")
                    .targetLocation(workOrder.getTargetLine())
                    .targetEquipment(dto.getEquipmentCode())
                    .workerName(worker != null ? worker.getName() : "SYSTEM")
                    .build();
            materialTxRepo.save(outboundTx);

            // =================================================
            // 3️⃣ 차감 후 재고가 0 → PAUSE
            // =================================================
            if (afterStock == 0) {

                workOrder.setStatus("PAUSED");
                workOrder.setShortageMaterialName(mat.getName());
                workOrder.setShortageQty(0);
                orderRepo.saveAndFlush(workOrder);

                ProductionLog zeroLog = ProductionLog.builder()
                        .workOrder(workOrder)
                        .level("WARN")
                        .category("PRODUCTION")
                        .message("*** [" + mat.getName() + "] 재고가 0이 되어 작업을 중단합니다")
                        .startTime(LocalDateTime.now())
                        .resultDate(LocalDate.now())
                        .resultQty(0)
                        .status(ProductionStatus.PAUSED)
                        .build();
                productionLogRepo.save(zeroLog);

                throw new CustomException("INVENTORY_EMPTY", mat.getName() + ":0");
            }
        }

        // =================================================
        // 🔥 생산 수량 증가 (BOM 루프 밖!)
        // =================================================
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
        productionLogRepo.save(log);
    }

    @Transactional(readOnly = true)
    public List<EventLogResDto> getEventLogs() {
        return productionLogRepo
                .findByMessageIsNotNullOrderByStartTimeDesc()
                .stream()
                .map(EventLogResDto::from)
                .toList();
    }

    @Transactional
    public void updateMessage(Long id, String message) {
        ProductionLog log = productionLogRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Log not found"));
        log.setMessage(message);
    }

    // ✅ 작업지시 상태 변경 시 ProductionLog(이벤트 로그) 1건 저장
    private void writeWorkOrderStatusChangeLog(WorkOrder order, String from, String to) {

        String level;
        if ("PAUSED".equals(to)) {
            level = "WARN";           // 🔥 중단은 경고
        } else {
            level = "INFO";           // 나머지는 정보
        }

        ProductionLog log = ProductionLog.builder()
                .workOrder(order)
                .level(level)
                .category("WORK_ORDER")   // 🔥 여기 중요
                .message("작업지시 상태 변경: " + from + " → " + to)
                .startTime(LocalDateTime.now())
                .resultDate(LocalDate.now())
                .resultQty(0)
                .status(ProductionStatus.RUN)
                .build();

        productionLogRepo.save(log);
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
    // 1. [Lot 추적] 전체 목록 조회
    @Transactional(readOnly = true)
    public List<LotResDto> getAllLotList() {
        return lotRepo.findAll().stream()
                .map(LotResDto::from)
                .collect(Collectors.toList());
    }

    // 2. [Lot 추적] 상세 이력 조회
    @Transactional(readOnly = true)
    public List<LotHistoryResDto> getLotHistory(Long lotId) {
        List<LotMapping> mappings = lotMappingRepo.findByLotId(lotId);

        return mappings.stream()
                .map(mapping -> {
                    ProductionLog log = mapping.getProductionLog();
                    String status = (log.getEndTime() != null) ? "DONE" : "RUNNING";
                    return LotHistoryResDto.builder()
                            .stepName(log.getProcessStep())
                            .status(status)
                            .time(log.getStartTime())
                            .worker(log.getWorker() != null ? log.getWorker().getName() : "-")
                            .result("Used for: " + log.getWorkOrder().getProduct().getName())
                            .build();
                })
                .sorted(Comparator.comparing(LotHistoryResDto::getTime))
                .collect(Collectors.toList());
    }

    // 3. [불량 관리] 불량 내역 조회
    @Transactional(readOnly = true)
    public List<ProductionLog> getDefectLogs() {
        return productionLogRepo.findByDefectQtyGreaterThanOrderByEndTimeDesc(0);
    }

}