package com.hm.mes_final_260106.dto.bom;

import com.hm.mes_final_260106.constant.ItemType;
import com.hm.mes_final_260106.dto.BomItem.BomItemCreateReqDto;
import com.hm.mes_final_260106.entity.BomItem;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BomResDto {
    private Long id;
    private String productCode;
    private String productName;
    private int revision;
    private ItemType type;
    private LocalDateTime lastUpdate;
}
