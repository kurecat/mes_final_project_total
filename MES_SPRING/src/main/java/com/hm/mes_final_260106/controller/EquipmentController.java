// src/main/java/com/hm/mes_final_260106/controller/EquipmentController.java
package com.hm.mes_final_260106.controller;

import com.hm.mes_final_260106.dto.EquipmentDetailResDto;
import com.hm.mes_final_260106.dto.EquipmentMonitorResDto;
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

    // =========================
// Equipment Monitoring
// =========================
    @GetMapping("/monitor")
    public ResponseEntity<List<EquipmentMonitorResDto>> getEquipmentMonitoring() {
        return ResponseEntity.ok(equipmentService.getMonitoringList());
    }

    // =========================
// Equipment Detail (Modal)
// =========================
    @GetMapping("/equipment/{equipmentCode}/detail")
    public ResponseEntity<EquipmentDetailResDto> getEquipmentDetail(
            @PathVariable String equipmentCode
    ) {
        return ResponseEntity.ok(equipmentService.getEquipmentDetail(equipmentCode));
    }

}
