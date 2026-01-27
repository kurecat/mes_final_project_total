package com.hm.mes_final_260106.controller;

import com.hm.mes_final_260106.dto.*;
import com.hm.mes_final_260106.service.InventoryService;
import com.hm.mes_final_260106.service.MaterialTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mes/material-tx")
@RequiredArgsConstructor
public class MaterialTransactionController {

    private final MaterialTransactionService txService;
    private final InventoryService inventoryService;
    // 입고 등록
    @PostMapping("/inbound")
    public ResponseEntity<MaterialTxResDto> inbound(@RequestBody MaterialInboundReqDto req) {
        return ResponseEntity.ok(txService.inbound(req));
    }

    // 불출 등록
    @PostMapping("/outbound")
    public ResponseEntity<MaterialTxResDto> outbound(@RequestBody MaterialOutboundReqDto req) {
        return ResponseEntity.ok(txService.outbound(req));
    }
    // 전체 트랜젝션 로그 조회
    @GetMapping("/transactions")
    public ResponseEntity<List<MaterialTxSimpleResDto>> getRecentTransactions(
            @RequestParam(defaultValue = "5") int limit
    ) {
        return ResponseEntity.ok(
                inventoryService.getRecentTxLogs(limit)
        );
    }

    // 오늘 트랜잭션 로그 조회
    @GetMapping("/transactions/today")
    public ResponseEntity<List<MaterialTxResDto>> todayLogs() {
        return ResponseEntity.ok(txService.getTodayLogs());
    }
}
