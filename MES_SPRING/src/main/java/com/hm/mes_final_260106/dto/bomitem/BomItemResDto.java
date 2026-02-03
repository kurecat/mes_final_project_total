package com.hm.mes_final_260106.dto.bomitem;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BomItemResDto {
    private Long id;
    private String materialCode;   // 자재 코드
    private String materialName;   // 자재 이름
    private String category;       // 카테고리
    private int quantity;       // 수량
    private String unit;           // 단위 (EA, KG 등)
}
