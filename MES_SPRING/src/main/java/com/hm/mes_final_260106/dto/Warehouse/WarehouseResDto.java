package com.hm.mes_final_260106.dto.Warehouse;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseResDto {
    private Long id;   // PK
    private String code;
    private String name;   // 창고 이름
    private String type;   // 창고 유형 (예: Main, Sub, ColdStorage 등)
    private String address;         // 주소 또는 LocationCode
    private String status;          // 상태 (예: Active, Inactive)
    private Integer capacity;   // 최대 저장 가능 갯수
    private Integer occupancy;  // 현재 저장된 갯수
}
