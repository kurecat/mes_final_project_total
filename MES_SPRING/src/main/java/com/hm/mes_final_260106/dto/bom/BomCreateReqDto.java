package com.hm.mes_final_260106.dto.bom;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BomCreateReqDto {
    private String productCode;
    private String materialCode;
    private int quantity;       // 수량
}
