package com.hm.mes_final_260106.controller;

import com.hm.mes_final_260106.entity.CommonCode;
import com.hm.mes_final_260106.repository.LoginLogRepository;
import com.hm.mes_final_260106.service.SystemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mes/system") // URL 주소 확인!
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class SystemController {
    private final LoginLogRepository logRepository;
    private final SystemService systemService;

    // ==========================================
    // 1. 공통 코드 관리 (Code Management)
    // ==========================================
    @GetMapping("/code")
    public ResponseEntity<?> getCodes(@RequestParam(required = false) String groupCode) {
        return ResponseEntity.ok(systemService.getCodes(groupCode));
    }

    @PostMapping("/code")
    public ResponseEntity<?> saveCode(@RequestBody CommonCode code) {
        return ResponseEntity.ok(systemService.saveCode(code));
    }

    // ==========================================
    // 2. 로그 관리 (Log Management)
    // ==========================================
    @GetMapping("/log")
    public ResponseEntity<?> getLogs() {
        // 서비스가 알아서 정렬된 거 가져옵니다.
        return ResponseEntity.ok(systemService.getLogs());
    }


    // ==========================================
    // 3. 권한/그룹 관리 (Role Management)
    // ==========================================
    // 그냥 회원 리스트 뿌려주고, 프론트에서 권한(ROLE_ADMIN 등) 보여주면 그게 권한관리임
    @GetMapping("/role")
    public ResponseEntity<?> getMemberRoles() {
        return ResponseEntity.ok(systemService.getMembers());
    }
}