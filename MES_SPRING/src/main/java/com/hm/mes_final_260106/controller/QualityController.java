package com.hm.mes_final_260106.controller;

import com.hm.mes_final_260106.entity.DieBonding;
import com.hm.mes_final_260106.entity.FinalInspection;
import com.hm.mes_final_260106.service.ProductionService; // ✅ ProductionService 임포트
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mes/quality")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000") // CORS 허용
public class QualityController {

    // ✅ QualityService 대신 이미 로직이 구현된 ProductionService를 주입받습니다.
    private final ProductionService productionService;

    // 1. 불량 검사 내역 조회 (DefectPage.js)
    @GetMapping("/defect")
    public ResponseEntity<List<FinalInspection>> getDefectList() {
        // ProductionService에 추가했던 메서드 호출
        return ResponseEntity.ok(productionService.getAllDefectLogs());
    }

    // 2. SPC 차트 데이터 조회 (SpcChartPage.js)
    @GetMapping("/spc")
    public ResponseEntity<List<DieBonding>> getSpcData() {
        // ProductionService에 추가했던 메서드 호출
        return ResponseEntity.ok(productionService.getAllDieBondingLogs());
    }

    // 3. 검사 기준 조회 API
    @GetMapping("/standard")
    public ResponseEntity<List<com.hm.mes_final_260106.entity.InspectionStandard>> getStandards(
            @RequestParam(required = false, defaultValue = "ALL") String process
    ) {
        return ResponseEntity.ok(productionService.getInspectionStandards(process));
    }
}