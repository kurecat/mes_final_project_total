// src/main/java/com/hm/mes_final_260106/controller/EquipmentController.java
package com.hm.mes_final_260106.controller;

import com.hm.mes_final_260106.constant.EquipmentStatus;
import com.hm.mes_final_260106.dto.*;
import com.hm.mes_final_260106.service.EquipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mes/equipment")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class EquipmentController {

    private final EquipmentService equipmentService;

    // 카드 리스트
    @GetMapping("/monitoring")
    public List<EquipmentMonitorResDto> monitoring() {
        return equipmentService.getMonitoringList();
    }

    // 상세 모달
    @GetMapping("/{equipmentCode}/detail")
    public EquipmentDetailResDto detail(@PathVariable String equipmentCode) {
        return equipmentService.getEquipmentDetail(equipmentCode);
    }

    // ❗ 중복 매핑 방지: 아래 logs API와 충돌 → 주석 처리
//    @GetMapping("/{equipmentId}/logs")
//    public ResponseEntity<List<EquipmentEventLogResDto>> getLogs(@PathVariable Long equipmentId) {
//        List<EquipmentEventLogResDto> logs = equipmentService.getEquipmentLogs(equipmentId);
//        return ResponseEntity.ok(logs);
//    }

    // 장비 모니터링
    @GetMapping("/monitor")
    public ResponseEntity<List<EquipmentMonitorResDto>> getEquipmentMonitoring() {
        return ResponseEntity.ok(equipmentService.getMonitoringList());
    }

    // ❗ 중복 의미(detail) → URL 충돌 방지 위해 주석 처리
//    @GetMapping("/equipment/{equipmentCode}/detail")
//    public ResponseEntity<EquipmentDetailResDto> getEquipmentDetail(
//            @PathVariable String equipmentCode
//    ) {
//        return ResponseEntity.ok(equipmentService.getEquipmentDetail(equipmentCode));
//    }

    // 장비 생성 및 저장
    @PostMapping("")
    public ResponseEntity<EquipmentResDto> createEquipment(@RequestBody EquipmentCreateReqDto dto) {
        EquipmentResDto savedEquipment = equipmentService.createEquipment(dto);
        return ResponseEntity.ok(savedEquipment);
    }

    // 장비 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEquipment(@PathVariable Long id) {
        equipmentService.deleteEquipment(id);
        return ResponseEntity.ok().build();
    }

    // 장비 수정 및 저장
    @PutMapping("/{id}")
    public ResponseEntity<EquipmentResDto> updateEquipment(
            @PathVariable Long id,
            @RequestBody EquipmentReqDto dto
    ) {
        EquipmentResDto res = equipmentService.updateEquipment(id, dto);
        return ResponseEntity.ok(res);
    }

    // 장비 상태변경
    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> changeStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        equipmentService.changeStatus(id, status);
        return ResponseEntity.ok().build();
    }

    /* =====================================================
       설비 이벤트 로그 전체 조회 (설비 로그 페이지)
       ===================================================== */
    @GetMapping("/logs")
    public List<EquipmentEventLogResDto> getAllEquipmentEventLogs() {
        return equipmentService.getAllEquipmentEventLogs();
    }

    /* =====================================================
       설비별 이벤트 로그 조회 (Machine 상세 / 필터)
       ===================================================== */
    @GetMapping("/{equipmentId}/logs")
    public List<EquipmentEventLogResDto> getEquipmentEventLogs(
            @PathVariable Long equipmentId
    ) {
        return equipmentService.getEquipmentLogs(equipmentId);
    }

    /* =====================================================
       설비 이벤트 로그 메시지 수정
       ===================================================== */
    @PatchMapping("/logs/{logId}")
    public ResponseEntity<Void> updateEquipmentEventLogMessage(
            @PathVariable Long logId,
            @RequestBody Map<String, String> body
    ) {
        equipmentService.updateEquipmentEventLogMessage(
                logId,
                body.get("message")
        );
        return ResponseEntity.ok().build();
    }
}
