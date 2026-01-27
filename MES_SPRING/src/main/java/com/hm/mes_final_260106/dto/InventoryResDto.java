package com.hm.mes_final_260106.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryResDto {
    private String id;        // material.code
    private String name;      // material.name
    private String type;      // material.category
    private String loc;       // 최근 transaction의 targetLocation (없으면 "-")
    private Integer qty;      // material.currentStock
    private Integer safety;   // (추가 컬럼 없으니 임시 0 or 기본값)
    private String unit;      // 최근 transaction의 unit (없으면 "ea")
    private String status;    // NORMAL / LOW
    private String condition; // 지금 엔티티에 없으니 "-" 처리
}

