// src/main/java/com/hm/mes_final_260106/controller/EquipmentController.java
package com.hm.mes_final_260106.controller;

import com.hm.mes_final_260106.dto.*;
import com.hm.mes_final_260106.service.EquipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mes/equipment")
@CrossOrigin(origins = "http://localhost:3000")
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


    // 장비 모니터링
    @GetMapping("/monitor")
    public ResponseEntity<List<EquipmentMonitorResDto>> getEquipmentMonitoring() {
        return ResponseEntity.ok(equipmentService.getMonitoringList());
    }


    // 장비 모니터링 세부사항 (Modal)
    @GetMapping("/equipment/{equipmentCode}/detail")
    public ResponseEntity<EquipmentDetailResDto> getEquipmentDetail(
            @PathVariable String equipmentCode
    ) {
        return ResponseEntity.ok(equipmentService.getEquipmentDetail(equipmentCode));
    }

    // 장비 생성 및 저장
    @PostMapping("")
    public ResponseEntity<?> createEquipment(@RequestBody EquipmentCreateReqDto dto) {
        equipmentService.createEquipment(dto);
        return ResponseEntity.ok().build();
    }
    // 장비 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEquipment(@PathVariable Long id) {
        equipmentService.deleteEquipment(id);
        return ResponseEntity.ok().build();
    }
    // 장비 수정 및 저장
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEquipment(
            @PathVariable Long id,
            @RequestBody EquipmentReqDto dto
    ) {
        EquipmentResDto res = equipmentService.updateEquipment(id, dto);
        return ResponseEntity.ok(res);
    }




}
