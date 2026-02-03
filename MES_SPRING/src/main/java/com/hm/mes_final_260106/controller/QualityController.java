package com.hm.mes_final_260106.controller;

import com.hm.mes_final_260106.entity.DieBonding;
import com.hm.mes_final_260106.entity.ProductionLog; // ✅ FinalInspection -> ProductionLog 변경
import com.hm.mes_final_260106.service.ProductionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mes/quality")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class QualityController {

    private final ProductionService productionService;

    // ==========================================
    // 1. 불량 검사 내역 조회 (DefectPage.js)
    // ==========================================
    // [수정] FinalInspection(최종검사)만 보는 게 아니라,
    //        전체 공정 중 불량이 1개라도 발생한 로그(ProductionLog)를 조회합니다.
    @GetMapping("/defect")
    public ResponseEntity<List<ProductionLog>> getDefectList() {
        // ProductionService에 방금 추가하신 getDefectLogs() 메서드를 호출해야 합니다.
        // (주의: getAllDefectLogs()는 최종검사만 가져오므로 getDefectLogs() 사용!)
        return ResponseEntity.ok(productionService.getDefectLogs());
    }

    // ==========================================
    // 2. SPC 차트 데이터 조회 (SpcChartPage.js)
    // ==========================================
    @GetMapping("/spc")
    public ResponseEntity<List<DieBonding>> getSpcData() {
        // DieBonding 공정 데이터를 SPC 분석용으로 보냅니다.
        return ResponseEntity.ok(productionService.getAllDieBondingLogs());
    }

    // ==========================================
    // 3. 검사 기준 조회 API
    // ==========================================
    @GetMapping("/standard")
    public ResponseEntity<List<com.hm.mes_final_260106.entity.InspectionStandard>> getStandards(
            @RequestParam(required = false, defaultValue = "ALL") String process
    ) {
        return ResponseEntity.ok(productionService.getInspectionStandards(process));
    }
}