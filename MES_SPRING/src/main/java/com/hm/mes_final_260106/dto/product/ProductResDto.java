package com.hm.mes_final_260106.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResDto {
    private Long id;          // PK
    private String code;      // 제품 코드
    private String name;      // 제품명
    private String category;  // 카테고리
    private String spec;      // 규격/사양
}
