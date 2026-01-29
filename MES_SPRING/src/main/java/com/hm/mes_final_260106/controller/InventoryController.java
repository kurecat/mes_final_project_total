package com.hm.mes_final_260106.controller;

import com.hm.mes_final_260106.dto.InventoryResDto;
import com.hm.mes_final_260106.dto.MaterialStockReqDto;
import com.hm.mes_final_260106.dto.MaterialTxResDto;
import com.hm.mes_final_260106.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mes/material")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class InventoryController {

    private final InventoryService inventoryService;

    // 재고현황 리스트
    @GetMapping("/inventory")
    public ResponseEntity<List<InventoryResDto>> getInventory() {
        return ResponseEntity.ok(inventoryService.getInventoryList());
    }

    // 입고
    @PostMapping("/in")
    public ResponseEntity<String> stockIn(@RequestBody MaterialStockReqDto req) {
        inventoryService.stockIn(req);
        return ResponseEntity.ok("입고 완료");
    }

    // 출고
    @PostMapping("/out")
    public ResponseEntity<String> stockOut(@RequestBody MaterialStockReqDto req) {
        inventoryService.stockOut(req);
        return ResponseEntity.ok("출고 완료");
    }

    // 트랜잭션 로그
    @GetMapping("/tx")
    public ResponseEntity<List<MaterialTxResDto>> getTxLogs(@RequestParam String materialCode) {
        return ResponseEntity.ok(inventoryService.getTxLogs(materialCode));
    }
}
