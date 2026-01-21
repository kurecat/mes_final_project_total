package com.hm.mes_final_260106.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialOutboundReqDto {

    private String materialBarcode;
    private Integer qty;
    private String unit;
    private String targetLocation;     // 불출 위치 (또는 출고창고)
    private String targetEquipment;    // ex) Photo-Line-A
    private String workerName;         // ex) Kim
}
