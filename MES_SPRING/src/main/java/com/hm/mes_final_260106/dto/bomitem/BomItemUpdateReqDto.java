package com.hm.mes_final_260106.dto.bomitem;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BomItemUpdateReqDto {
    private Long id;
    private String materialCode;
    private int quantity;       // 수량
}
