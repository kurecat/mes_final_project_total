package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.constant.Authority;
import com.hm.mes_final_260106.dto.*;
import com.hm.mes_final_260106.entity.Bom;
import com.hm.mes_final_260106.entity.Material;
import com.hm.mes_final_260106.entity.ProductionLog;
import com.hm.mes_final_260106.entity.WorkOrder;
import com.hm.mes_final_260106.entity.*;
import com.hm.mes_final_260106.exception.CustomException;
import com.hm.mes_final_260106.repository.*;
import com.hm.mes_final_260106.mapper.Mapper;
import com.hm.mes_final_260106.repository.ProductionResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sound.sampled.TargetDataLine;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Slf4j
public class ProductionService {

    private final ProductionLogRepository logRepo;
    private final MaterialRepository matRepo;
    private final WorkOrderRepository orderRepo;
    private final BomRepository bomRepo;
    private final ProductRepository productRepo;
    private final LotRepository lotRepo;
    private final LotMappingRepository lotMappingRepo;
    private final EquipmentRepository equipmentRepo;
    private final MemberRepository memberRepo;
    private final WorkerRepository workerRepo;
    private final PasswordEncoder passwordEncoder;

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
                .orElseThrow(()-> new RuntimeException("품목을 찾을 수 없습니다"));

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
        order.setEndDate(LocalDateTime.now());

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
    public WorkOrder updateWorkOrder(Long id, String productCode, int targetQty, String targetLine) {

        WorkOrder order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("작업 지시를 찾을 수 없습니다. ID: " + id));

        Product product = productRepo.findByCode(productCode)
                .orElseThrow(()-> new RuntimeException("품목을 찾을 수 없습니다"));

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
        if ("IN_PROGRESS".equals(status) && order.getStartDate() == null) {
            order.setStartDate(LocalDateTime.now()); // ⭐
        }

        if ("COMPLETED".equals(status)) {
            order.setEndDate(LocalDateTime.now()); // ⭐
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
        log.info("reportProduction 실행 : {}", dto.getWorkOrderId());
        log.info("itemDtos : {}", dto.getItemDtos());
        log.info("inputLots : {}", dto.getInputLots());
        Long orderId = dto.getWorkOrderId();

        // 지시 정보 확인
        WorkOrder workOrder = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("작업 지시를 찾을 수 없습니다. ID: " + orderId));

        Product product = workOrder.getProduct();

        Member member = memberRepo.findById(dto.getMemberId())
                .orElseThrow(() -> new RuntimeException("작업자를 찾을 수 없습니다"));

        Equipment equipment = equipmentRepo.findByCode(dto.getEquipmentCode())
                .orElseThrow(() -> new RuntimeException("설비를 찾을 수 없습니다"));

        ProductionLog productionLog = mapper.toEntity(dto);
        productionLog.setWorkOrder(workOrder);
        productionLog.setMember(member);
        productionLog.setEquipment(equipment);

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
        List<LotMapping>  lotMappings = new ArrayList<>();

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

        List<Bom> boms = bomRepo.findAllByProductCode(workOrder.getProduct().getCode());
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

        // 수량 증가
        workOrder.setCurrentQty(workOrder.getCurrentQty() + 1);

        // 완료 처리
        if (workOrder.getCurrentQty() >= workOrder.getTargetQty()) {
            workOrder.setStatus("COMPLETED");
            workOrder.setEndDate(LocalDateTime.now()); // 생산 마감 시점 기록
        }

        log.info("[생산 보고] 제품:{} 상태:{} 수량:{}/{}",
                workOrder.getProduct().getCode(), workOrder.getStatus(), workOrder.getCurrentQty(), workOrder.getTargetQty());

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

    // 생산실적현황 서비스
    @Transactional(readOnly = true)
    public PerformanceSummaryResDto getPerformanceSummary(LocalDate date, String line) {

        // ✅ 수정: Repository에서 DTO를 바로 받으므로 캐스팅/배열처리 하면 안됨
        PerformanceSummaryResDto dto = productionResultRepo.getSummary(date, line);

        // ✅ 추가: 혹시 null 방어 (데이터 없을 때)
        if (dto == null) {
            return new PerformanceSummaryResDto(0L, 0L, 0L, 0.0);
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public List<HourlyPerformanceResDto> getHourlyPerformance(LocalDate date, String line) {
        // 1. Repository에서 Native Query 실행 (Object[] 리스트 반환)
        List<Object[]> results = productionResultRepo.getHourlyNative(date, line);

        // 2. Object[]를 DTO로 변환
        return results.stream()
                .map(result -> new HourlyPerformanceResDto(
                        (String) result[0],                      // time
                        ((Number) result[1]).longValue(),        // plan
                        ((Number) result[2]).longValue(),        // actual
                        ((Number) result[3]).longValue()         // scrap
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkOrderPerformanceResDto> getWorkOrderPerformanceList(LocalDate date, String line) {

        // 1) 라인 기준 WorkOrder 조회
        List<WorkOrder> orders = orderRepo.findByLineForPerformance(line);

        // 2) DTO 변환
        return orders.stream().map(wo -> {

            long plan = (long) wo.getTargetQty();
            long actual = (long) wo.getCurrentQty();
            long loss = Math.max(plan - actual, 0L);
            double rate = (plan == 0L) ? 0.0 : (actual * 100.0 / plan);
            String status = "IN_PROGRESS".equals(wo.getStatus()) ? "RUNNING" : wo.getStatus();

            return new WorkOrderPerformanceResDto(
                    wo.getWorkOrderNumber(),   // woId
                    wo.getProduct().getCode(),
                    wo.getTargetLine(),         // line
                    "wfrs",                     // unit (고정, 필요시 제품단위로 바꿀 수 있음)
                    plan,
                    actual,
                    loss,
                    rate,
                    status
            );
        }).toList();
    }

    // 작업자 등록
    @Transactional
    public WorkerResDto registerWorker(WorkerCreateReqDto dto) {

        // 1) Member 생성
        memberRepo.findByEmail(dto.getEmail()).ifPresent(m -> {
            throw new RuntimeException("이미 존재하는 이메일입니다: " + dto.getEmail());
        });

        Member member = Member.builder()
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .name(dto.getName())
                .authority(Authority.valueOf(dto.getAuthority() == null ? "OPERATOR" : dto.getAuthority()))
                .build();

        Member savedMember = memberRepo.save(member);

        // 2) Worker 생성
        String certStr = (dto.getCertifications() == null || dto.getCertifications().isEmpty())
                ? ""
                : String.join(",", dto.getCertifications());

        Worker worker = Worker.builder()
                .member(savedMember)
                .dept(dto.getDept() == null ? "TBD" : dto.getDept())
                .shift(dto.getShift() == null ? "Day" : dto.getShift())
                .status(dto.getStatus() == null ? "OFF" : dto.getStatus())
                .joinDate(dto.getJoinDate() == null ? LocalDate.now() : dto.getJoinDate())
                .certifications(certStr)
                .build();

        Worker savedWorker = workerRepo.save(worker);

        return WorkerResDto.fromEntity(savedWorker);
    }
    // 작업자 수정
    @Transactional
    public WorkerResDto updateWorker(Long workerId, WorkerUpdateReqDto dto) {

        Worker worker = workerRepo.findById(workerId)
                .orElseThrow(() -> new RuntimeException("작업자를 찾을 수 없습니다. id=" + workerId));

        // 1) WorkerProfile(Worker 테이블) 수정
        if (dto.getDept() != null) worker.setDept(dto.getDept());
        if (dto.getShift() != null) worker.setShift(dto.getShift());
        if (dto.getStatus() != null) worker.setStatus(dto.getStatus());


        if (dto.getCertifications() != null) {
            worker.setCertifications(String.join(",", dto.getCertifications()));
        }

        // 2) Member 수정 (name/authority)
        Member member = worker.getMember();
        if (dto.getName() != null) member.setName(dto.getName());
        if (dto.getAuthority() != null) member.setAuthority(Authority.valueOf(dto.getAuthority()));

        // 저장 (worker만 save해도 member는 영속 상태라 반영됨)
        Worker saved = workerRepo.save(worker);

        return WorkerResDto.fromEntity(saved);
    }
    // 작업자 삭제
    @Transactional
    public void deleteWorker(Long workerId) {

        Worker worker = workerRepo.findById(workerId)
                .orElseThrow(() -> new RuntimeException("작업자를 찾을 수 없습니다. id=" + workerId));

        // ⭐ Worker만 삭제 (Member는 유지)
        workerRepo.delete(worker);
    }

    // ==========================================
    //  8. 기준 정보 조회 (Frontend 연동용) - [추가됨]
    // ==========================================

    // 1) 설비 목록 조회
    public List<Equipment> getAllEquipments() {
        return equipmentRepo.findAll();
    }

    // 2) 자재 목록 조회
    public List<Material> getAllMaterials() {
        return matRepo.findAll();
    }

    // 3) 품목(제품) 목록 조회
    public List<Product> getAllProducts() {
        return productRepo.findAll();
    }

    // ==========================================
    //  11. 품질(Quality) 및 BOM API 로직 - [추가됨]
    // ==========================================

    // 1) BOM 목록 조회
    public List<Bom> getAllBoms() {
        return bomRepo.findAll();
    }

    // 2) 불량 현황 조회 (DefectPage용)
    public List<FinalInspection> getAllDefectLogs() {
        return finalInspectionLRepo.findAll(); // 변수명 finalInspectionLRepo 주의
    }

    // 3) SPC 차트 데이터 (DieBonding 온도/압력 등)
    public List<DieBonding> getAllDieBondingLogs() {
        return dieBondingRepo.findAll();
    }

    // (선택사항) Molding SPC 데이터도 필요하다면 추가
    public List<Molding> getAllMoldingLogs() {
        return moldingRepo.findAll();
    }
    // ==========================================
    //  12. 실시간 실적 집계 (Dashboard용) - [추가됨]
    // ==========================================
    private void updateProductionResult(WorkOrder order, Product product, int goodQty, int defectQty) {
        LocalDate today = LocalDate.now();
        int currentHour = LocalDateTime.now().getHour();
        String line = order.getTargetLine(); // 작업지시의 라인 정보 사용

        // 1. 해당 시간대의 실적 데이터가 있는지 확인
        ProductionResult result = productionResultRepo
                .findByResultDateAndResultHourAndLineAndProduct(today, currentHour, line, product)
                .orElseGet(() -> {
                    // 없으면 새로 생성
                    ProductionResult newResult = new ProductionResult();
                    newResult.setResultDate(today);
                    newResult.setResultHour(currentHour);
                    newResult.setLine(line);
                    newResult.setProduct(product);
                    newResult.setPlanQty(0); // 계획 수량은 별도 로직이나 0으로 시작
                    newResult.setGoodQty(0);
                    newResult.setDefectQty(0);
                    newResult.setCreatedAt(LocalDateTime.now());
                    return newResult;
                });

        // 2. 수량 누적
        result.setGoodQty(result.getGoodQty() + goodQty);
        result.setDefectQty(result.getDefectQty() + defectQty);

        // 3. 저장
        productionResultRepo.save(result);
    }
    // ==========================================
    //  14. 품질 검사 기준 조회 (Quality Standard)
    // ==========================================
    public List<InspectionStandard> getInspectionStandards(String processName) {
        // 데이터가 하나도 없으면 테스트용 더미 데이터 자동 생성 (편의상)
        if (standardRepo.count() == 0) {
            standardRepo.save(InspectionStandard.builder().processName("DieBonding").checkItem("Bonding Temp").lsl(150.0).usl(180.0).unit("°C").description("접합 온도 기준").build());
            standardRepo.save(InspectionStandard.builder().processName("WireBonding").checkItem("Tensile Strength").lsl(50.0).usl(100.0).unit("N").description("와이어 인장 강도").build());
            standardRepo.save(InspectionStandard.builder().processName("Molding").checkItem("Pressure").lsl(10.0).usl(20.0).unit("Bar").description("몰딩 압력 기준").build());
        }

        if (processName == null || "ALL".equals(processName)) {
            return standardRepo.findAll();
        }
        return standardRepo.findByProcessName(processName);
    }
 //11
}

