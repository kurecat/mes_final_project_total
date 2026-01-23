package com.hm.mes_final_260106.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkOrderPerformanceResDto {
    private String woId;
    private String product;
    private String line;
    private String unit;

    private Long planQty;
    private Long actualQty;
    private Long lossQty;

    private Double rate;   // 달성률 %
    private String status; // RUNNING / COMPLETED
}
///1111111111
