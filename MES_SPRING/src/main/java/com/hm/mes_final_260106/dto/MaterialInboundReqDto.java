package com.hm.mes_final_260106.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialInboundReqDto {

    private String materialBarcode;   // ex) WF-001
    private Integer qty;                 // 입고 수량
    private String unit;              // ea / Box / L ...
    private String targetLocation;    // ex) WH-Raw-01
    private String workerName;        // ex) Admin
}
///1111111111