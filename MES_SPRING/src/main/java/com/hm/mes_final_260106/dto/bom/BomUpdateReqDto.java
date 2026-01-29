package com.hm.mes_final_260106.dto.bom;

import com.hm.mes_final_260106.dto.BomItem.BomItemCreateReqDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BomUpdateReqDto {
    private List<BomItemCreateReqDto> bomItem;
}
