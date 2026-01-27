package com.hm.mes_final_260106.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialStockReqDto {
    private String materialCode;
    private Integer qty;
    private String unit;
    private String targetLocation;
    private String targetEquipment;
    private String workerName;
}
