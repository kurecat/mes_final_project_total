package com.hm.mes_final_260106.controller;

import com.hm.mes_final_260106.dto.RoleDto;
import com.hm.mes_final_260106.dto.RolePermissionUpdateDto;
import com.hm.mes_final_260106.entity.CommonCode;
import com.hm.mes_final_260106.entity.Role;
import com.hm.mes_final_260106.repository.LoginLogRepository;
import com.hm.mes_final_260106.service.SystemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mes/system")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
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
        return ResponseEntity.ok(systemService.getLogs());
    }

    // ==========================================
    // 3. 사용자 목록 조회 (User Management)
    // ==========================================
    // UsersPage.js에서 사용 (기존 유지)
    @GetMapping("/role")
    public ResponseEntity<?> getMemberRoles() {
        return ResponseEntity.ok(systemService.getMembers());
    }

    // ==========================================
    // 4. 역할(Role) & 권한(Permission) 관리
    // ==========================================

    // [RolesPage.js] 전체 역할 목록 조회 (권한 ID 포함)
    @GetMapping("/roles")
    public ResponseEntity<?> getRoles() {
        // List<RoleDto> 반환
        return ResponseEntity.ok(systemService.getAllRoles());
    }

    // [RolesPage.js] 전체 권한 목록 조회
    @GetMapping("/permissions")
    public ResponseEntity<?> getPermissions() {
        // List<Permission> 반환 (DB 조회)
        return ResponseEntity.ok(systemService.getAllPermissions());
    }

    // [RolesPage.js] 새 역할 생성
    @PostMapping("/role")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> createRole(@RequestBody Role role) {
        return ResponseEntity.ok(systemService.createRole(role));
    }

    // [RolesPage.js] 역할 삭제
    @DeleteMapping("/role/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteRole(@PathVariable Long id) {
        systemService.deleteRole(id);
        return ResponseEntity.ok("Role deleted successfully");
    }

    // [RolesPage.js] 역할별 권한 설정 업데이트 (체크박스 저장)
    @PutMapping("/role/{id}/permissions")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateRolePermissions(
            @PathVariable Long id,
            @RequestBody RolePermissionUpdateDto dto) {

        systemService.updateRolePermissions(id, dto.getPermissionIds());
        return ResponseEntity.ok("Permissions updated successfully");
    }
}