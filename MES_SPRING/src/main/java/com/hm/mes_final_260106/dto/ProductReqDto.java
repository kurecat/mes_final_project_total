package com.hm.mes_final_260106.dto;

import lombok.Data;

@Data
public class ProductReqDto {
    private String code;     // 제품 코드 (예: PROD-001)
    private String name;     // 제품명
    private String category; // 카테고리
    private String spec;     // 규격
}
///1111111111