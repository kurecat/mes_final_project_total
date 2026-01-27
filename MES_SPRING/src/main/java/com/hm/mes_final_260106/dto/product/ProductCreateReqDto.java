package com.hm.mes_final_260106.dto.product;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ProductCreateReqDto {
    private String code;      // 제품 코드 (Unique)
    private String name;      // 제품명
    private String category;  // 카테고리
    private String spec;      // 규격/사양
}
