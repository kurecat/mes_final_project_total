package com.hm.mes_final_260106.dto.BomItem;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BomItemCreateReqDto {
    private String materialCode;
    private int quantity;       // 수량
}
