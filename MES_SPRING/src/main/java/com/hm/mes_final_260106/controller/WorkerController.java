package com.hm.mes_final_260106.controller;

import com.hm.mes_final_260106.dto.worker.WorkerResDto;
import com.hm.mes_final_260106.service.WorkerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/mes/worker")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class WorkerController {
    private final WorkerService workerService;

    @GetMapping
    public ResponseEntity<WorkerResDto> getWorker(Authentication authentication) {
        Long memberId = Long.parseLong(authentication.getName());
        WorkerResDto dto = workerService.findByMemberId(memberId);
        return ResponseEntity.ok(dto);
    }
}
