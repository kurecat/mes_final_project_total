package com.hm.mes_final_260106.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductionLogEventReqDto {
    private Long workOrderId;
    private String actionType; // START / PAUSE / FINISH
}
