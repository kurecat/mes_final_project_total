package com.hm.mes_final_260106.dto;

import lombok.Data;

@Data
public class BomReqDto {
    private String productCode;  // 어떤 제품의 BOM인가?
    private String materialCode; // 어떤 자재가 들어가는가?
    private int requiredQty;     // 몇 개가 필요한가?
}