package com.hm.mes_final_260106.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;

@Getter
@NoArgsConstructor
public class RolePermissionUpdateDto {
    private List<Long> permissionIds;
}