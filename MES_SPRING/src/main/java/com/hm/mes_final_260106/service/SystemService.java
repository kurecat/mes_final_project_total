package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.dto.MemberResDto;
import com.hm.mes_final_260106.dto.RoleDto;
import com.hm.mes_final_260106.entity.*;
import com.hm.mes_final_260106.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SystemService {

    private final CommonCodeRepository commonCodeRepository;
    private final LoginLogRepository loginLogRepository;
    private final MemberRepository memberRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    // --- 1. 공통 코드 관리 ---
    public List<CommonCode> getCodes(String groupCode) {
        if (groupCode != null && !groupCode.isEmpty()) {
            return commonCodeRepository.findByGroupCode(groupCode);
        }
        return commonCodeRepository.findAll();
    }

    @Transactional
    public CommonCode saveCode(CommonCode code) {
        return commonCodeRepository.save(code);
    }

    // --- 2. 로그 관리 ---
    public List<LoginLog> getLogs() {
        // 최신순 정렬
        return loginLogRepository.findAll(Sort.by(Sort.Direction.DESC, "loginTime"));
    }

    // --- 3. 권한/회원 관리 (MemberResDto로 변환해서 반환) ---
    public List<MemberResDto> getMembers() {
        List<Member> members = memberRepository.findAll();

        // Entity -> DTO 변환
        return members.stream()
                .map(MemberResDto::of) // MemberResDto에 static of 메서드가 있다고 가정
                .collect(Collectors.toList());
    }

    // 1. 전체 역할 목록 조회
    public List<RoleDto> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(RoleDto::from)
                .collect(Collectors.toList());
    }

    // 2. 역할 생성
    @Transactional
    public RoleDto createRole(RoleDto dto) {
        Role role = Role.builder()
                .name(dto.getName())
                .code(dto.getCode()) // 코드 필드가 있다면
                .description(dto.getDescription())
                // ★ null 체크 후 저장 (null이면 false로 처리)
                .isSystem(dto.getIsSystem() != null && dto.getIsSystem())
                .build();

        Role savedRole = roleRepository.save(role);
        return RoleDto.from(savedRole);
    }

    // 3. 역할 삭제
    @Transactional
    public void deleteRole(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 역할입니다."));

        if (role.isSystem()) {
            throw new IllegalStateException("시스템 기본 역할은 삭제할 수 없습니다.");
        }
        roleRepository.delete(role);
    }

    // --- 권한(Permission) 관리 ---

    // 4. 전체 권한 목록 조회
    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }

    // 5. 역할에 권한 매핑 업데이트
    @Transactional
    public void updateRolePermissions(Long roleId, List<Long> permissionIds) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 역할입니다."));

        // ID 목록으로 권한 엔티티들을 찾음
        List<Permission> permissions = permissionRepository.findAllById(permissionIds);

        // 역할의 권한 목록을 갱신 (Set으로 중복 제거)
        role.setPermissions(new HashSet<>(permissions));

        // Dirty Checking에 의해 트랜잭션 종료 시 자동 저장됨
    }
}