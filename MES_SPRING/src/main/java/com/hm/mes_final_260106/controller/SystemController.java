package com.hm.mes_final_260106.controller;

import com.hm.mes_final_260106.dto.RoleDto; // ★ Import 확인
import com.hm.mes_final_260106.dto.RolePermissionUpdateDto;
import com.hm.mes_final_260106.entity.CommonCode;
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

    // 1. 공통 코드 관리
    @GetMapping("/code")
    public ResponseEntity<?> getCodes(@RequestParam(required = false) String groupCode) {
        return ResponseEntity.ok(systemService.getCodes(groupCode));
    }

    @PostMapping("/code")
    public ResponseEntity<?> saveCode(@RequestBody CommonCode code) {
        return ResponseEntity.ok(systemService.saveCode(code));
    }

    // 2. 로그 관리
    @GetMapping("/log")
    public ResponseEntity<?> getLogs() {
        return ResponseEntity.ok(systemService.getLogs());
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

    // ★★★ [수정 핵심] Role Entity 대신 RoleDto를 받도록 변경 ★★★
    // 이제 null 값이 들어와도 DTO의 Boolean 타입이 처리하므로 400 에러가 사라집니다.
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