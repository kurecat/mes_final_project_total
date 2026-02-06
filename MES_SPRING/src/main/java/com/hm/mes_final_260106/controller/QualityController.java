package com.hm.mes_final_260106.controller;

import com.hm.mes_final_260106.entity.ProductionLog;
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
    // ✅ 유일하게 남겨두는 메서드 (SpcController에는 없음)
    @GetMapping("/defect")
    public ResponseEntity<List<ProductionLog>> getDefectList() {
        return ResponseEntity.ok(productionService.getDefectLogs());
    }

    // ❌ [삭제] SPC 데이터 조회 -> SpcController로 이관됨
    // ❌ [삭제] 기준 정보 조회 -> SpcController로 이관됨
}