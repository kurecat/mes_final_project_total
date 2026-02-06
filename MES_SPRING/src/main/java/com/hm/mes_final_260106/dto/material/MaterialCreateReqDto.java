package com.hm.mes_final_260106.dto.material;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class MaterialCreateReqDto {
    private String code;          // 자재 코드
    private String name;          // 자재명
    private String category;      // 카테고리
    private String spec;          // 규격/사양
    private Integer currentStock; // 현재 재고
    private Integer safetyStock;  // 안전 재고
    private String location;      // 위치
}