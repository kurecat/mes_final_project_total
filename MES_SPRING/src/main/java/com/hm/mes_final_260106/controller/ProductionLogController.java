package com.hm.mes_final_260106.controller;

import com.hm.mes_final_260106.dto.productionLog.ProductionLogCreateReqDto;
import com.hm.mes_final_260106.dto.productionLog.ProductionLogResDto;
import com.hm.mes_final_260106.service.ProductionLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mes/production-log")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ProductionLogController {

    private final ProductionLogService productionLogService;

    // Create (생산 로그 보고)
    @PostMapping
    public ResponseEntity<ProductionLogResDto> reportProductionLog(
            @RequestBody ProductionLogCreateReqDto dto) {
        return ResponseEntity.ok(productionLogService.reportProduction(dto));
    }

    // Read (전체 조회)
    @GetMapping("/list")
    public ResponseEntity<List<ProductionLogResDto>> getAllProductionLogs() {
        return ResponseEntity.ok(productionLogService.getAllProductionLogs());
    }

    // Read (단건 조회)
    @GetMapping("/{id}")
    public ResponseEntity<ProductionLogResDto> getProductionLogById(@PathVariable Long id) {
        return ResponseEntity.ok(productionLogService.getProductionLogById(id));
    }

    // Delete (삭제)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductionLog(@PathVariable Long id) {
        productionLogService.deleteProductionLog(id);
        return ResponseEntity.noContent().build();
    }
}