package com.hm.mes_final_260106.controller;

/*
// 임시 비활성화: 다른 모듈로 인한 서버 실행 문제 해결을 위해 MesController를 임시로 주석 처리합니다.
// 협업 중인 다른 개발자의 작업에 영향을 주지 않기 위함입니다. (백엔드 담당: 시큐리티, JWT, 멤버, 어드민 기능)

import com.hm.mes_final_260106.dto.*;
import com.hm.mes_final_260106.entity.Material;
import com.hm.mes_final_260106.entity.WorkOrder;
import com.hm.mes_final_260106.service.ProductionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;

// 웹 대시보드 및 설비(C#)를 연결하는 Controller
@RestController
@RequestMapping("/api/mes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@Slf4j
public class MesController {

    private final ProductionService productionService;

    // =========================
    // Dashboard : 자재 입고
    // =========================
    @PostMapping("/material/inbound")
    public ResponseEntity<Material> inboundMaterial(@RequestBody MaterialInboundDto dto) {
        log.info("자재 입고 : {}", dto);
        return ResponseEntity.ok(
                productionService.inboundMaterial(dto.getCode(), dto.getName(), dto.getAmount())
        );
    }

    // =========================
    // Dashboard : 자재 재고 조회
    // =========================
    @GetMapping("/material/stock")
    public ResponseEntity<List<Material>> getMaterialStock() {
        return ResponseEntity.ok(productionService.getMaterialStock());
    }

    // =========================
    // 작업지시 생성
    // =========================
    @PostMapping("/order")
    public ResponseEntity<WorkOrderResDto> createOrder(@RequestBody WorkOrderReqDto dto) {
        WorkOrder order = productionService.createWorkOrder(dto.getProductId(), dto.getTargetQty(),dto.getTargetLine());
        return ResponseEntity.ok(WorkOrderResDto.fromEntity(order));
    }

    // =========================
    // 작업지시 목록 조회
    // =========================
    @GetMapping("/order")
    public ResponseEntity<List<WorkOrderResDto>> getAllOrders() {
        return ResponseEntity.ok(
                productionService.getAllWorkOrders()
                        .stream()
                        .map(WorkOrderResDto::fromEntity)
                        .toList()
        );
    }

    // =========================
    // 작업지시 Release (WAITING -> RELEASED)
    // =========================
    @PostMapping("/order/{id}/release")
    public ResponseEntity<WorkOrderResDto> releaseOrder(@PathVariable Long id) {
        WorkOrder order = productionService.releaseWorkOrder(id);
        return ResponseEntity.ok(WorkOrderResDto.fromEntity(order));
    }

    // ============================
    // 작업지시 Start (RELEASED -> IN_PROGRESS)
    // ============================
    @PostMapping("/order/{id}/start")
    public ResponseEntity<WorkOrderResDto> startOrder(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "MACHINE-01") String machineId
    ) {
        WorkOrder order = productionService.startWorkOrder(id, machineId);
        return ResponseEntity.ok(WorkOrderResDto.fromEntity(order));
    }

    // ============================
    // 작업지시 Finish (IN_PROGRESS -> COMPLETED)
    // ============================
    @PostMapping("/order/{id}/finish")
    public ResponseEntity<WorkOrderResDto> finishOrder(@PathVariable Long id) {
        WorkOrder order = productionService.finishWorkOrder(id);
        return ResponseEntity.ok(WorkOrderResDto.fromEntity(order));
    }

    // =========================
    // 작업지시 삭제
    // =========================
    @DeleteMapping("/order/{id}")
    public ResponseEntity<String> deleteOrder(@PathVariable Long id) {
        productionService.deleteWorkOrder(id);
        return ResponseEntity.ok("삭제 완료");
    }

    // =========================
    // 작업지시 수정
    // =========================
    @PutMapping("/order/{id}")
    public ResponseEntity<WorkOrderResDto> updateOrder(
            @PathVariable Long id,
            @RequestBody WorkOrderReqDto dto
    ) {
        WorkOrder updated = productionService.updateWorkOrder(id, dto.getProductId(), dto.getTargetQty(),dto.getTargetLine());
        return ResponseEntity.ok(WorkOrderResDto.fromEntity(updated));
    }

    // ================================
    // ⭐ 정석: 작업지시 상태 변경 API (Start/Pause/Resume/Finish)
    // ================================
    @PatchMapping("/order/{id}/status")
    public ResponseEntity<WorkOrderResDto> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody WorkOrderStatusUpdateReqDto dto
    ) {
        WorkOrder updated = productionService.updateWorkOrderStatus(id, dto.getStatus()); // ⭐
        return ResponseEntity.ok(WorkOrderResDto.fromEntity(updated));
    }

    // =========================
    // Machine : 설비 작업 할당 (C# Polling)
    // =========================
    @GetMapping("/machine/poll")
    public ResponseEntity<WorkOrderResDto> pollWork(@RequestParam String machineId) {
        WorkOrder work = productionService.assignWorkToMachine(machineId);
        return (work != null)
                ? ResponseEntity.ok(WorkOrderResDto.fromEntity(work))
                : ResponseEntity.noContent().build();
    }

    // =========================
    // Machine : 생산 결과 보고
    // =========================
    @PostMapping("/machine/report")
    public ResponseEntity<String> reportProduction(@RequestBody ProductionReportDto dto) {
        productionService.reportProduction(dto);
        return ResponseEntity.ok("ACK");
    }
    // 당일생산수량 합계
    @GetMapping("/performance/summary")
    public ResponseEntity<PerformanceSummaryResDto> getPerformanceSummary(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date,
            @RequestParam(defaultValue = "ALL") String line
    ) {
        return ResponseEntity.ok(
                productionService.getPerformanceSummary(date, line)
        );
    }





}
*/
