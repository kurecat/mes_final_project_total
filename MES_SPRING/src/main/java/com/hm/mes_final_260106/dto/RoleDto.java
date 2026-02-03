package com.hm.mes_final_260106.dto;

import com.hm.mes_final_260106.entity.Role;
import com.hm.mes_final_260106.entity.Permission;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleDto {
    private Long id;
    private String name;
    private String code;
    private String description;
    private boolean isSystem;
    private List<Long> permissionIds; // 프론트엔드에서 체크박스 상태 관리에 필요

    // Entity -> DTO 변환 메서드
    public static RoleDto from(Role role) {
        return RoleDto.builder()
                .id(role.getId())
                .name(role.getName())
                .code(role.getCode())
                .description(role.getDescription())
                .isSystem(role.isSystem())
                .permissionIds(role.getPermissions().stream()
                        .map(Permission::getId)
                        .collect(Collectors.toList()))
                .build();
    }
}