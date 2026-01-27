package com.hm.mes_final_260106.dto.bom;

import com.hm.mes_final_260106.dto.product.ProductResDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BomUpdateReqDto {
    private Long materialId;
    private Long productId;
    private int quantity;       // 수량
}
