package com.hm.mes_final_260106.controller;

import com.hm.mes_final_260106.dto.RoleDto;
import com.hm.mes_final_260106.dto.RolePermissionUpdateDto;
import com.hm.mes_final_260106.entity.CommonCode;
import com.hm.mes_final_260106.entity.LoginLog; // ★ LoginLog 엔티티 import
import com.hm.mes_final_260106.repository.LoginLogRepository; // ★ Repository import
import com.hm.mes_final_260106.service.SystemService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort; // ★ 정렬을 위해 import
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mes/system")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class SystemController {

    // ★ LoginLogRepository 주입 (이미 선언되어 있으므로 활용)
    private final LoginLogRepository logRepository;
    private final SystemService systemService;

    // 1. 공통 코드 관리
    @GetMapping("/code")
    public ResponseEntity<?> getCodes(@RequestParam(required = false) String groupCode) {
        return ResponseEntity.ok(systemService.getCodes(groupCode));
    }

    @PostMapping("/code")
    public ResponseEntity<?> saveCode(@RequestBody CommonCode code) {
        return ResponseEntity.ok(systemService.saveCode(code));
    }

    // 2. 로그 관리 (수정됨)
    // ★ systemService.getLogs() 대신 loginLogRepository에서 직접 조회
    @GetMapping("/log")
    public ResponseEntity<?> getLogs() {
        // ID 기준 내림차순(최신순)으로 모든 로그 조회
        List<LoginLog> logs = logRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        return ResponseEntity.ok(logs);
    }

    // 3. 사용자 목록 조회 (Role 포함)
    @GetMapping("/role")
    public ResponseEntity<?> getMemberRoles() {
        return ResponseEntity.ok(systemService.getMembers());
    }

    // ==========================================
    // 4. 역할(Role) & 권한(Permission) 관리
    // ==========================================

    @GetMapping("/roles")
    public ResponseEntity<?> getRoles() {
        return ResponseEntity.ok(systemService.getAllRoles());
    }

    @GetMapping("/permissions")
    public ResponseEntity<?> getPermissions() {
        return ResponseEntity.ok(systemService.getAllPermissions());
    }

    @PostMapping("/role")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> createRole(@RequestBody RoleDto roleDto) {
        return ResponseEntity.ok(systemService.createRole(roleDto));
    }

    @PutMapping("/role/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateRole(
            @PathVariable Long id,
            @RequestBody RoleDto roleDto
    ) {
        return ResponseEntity.ok(systemService.updateRole(id, roleDto));
    }

    @DeleteMapping("/role/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteRole(@PathVariable Long id) {
        systemService.deleteRole(id);
        return ResponseEntity.ok("Role deleted successfully");
    }

    @PutMapping("/role/{id}/permissions")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateRolePermissions(
            @PathVariable Long id,
            @RequestBody RolePermissionUpdateDto dto) {

        systemService.updateRolePermissions(id, dto.getPermissionIds());
        return ResponseEntity.ok("Permissions updated successfully");
    }
}