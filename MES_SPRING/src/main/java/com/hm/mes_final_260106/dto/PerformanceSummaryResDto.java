package com.hm.mes_final_260106.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceSummaryResDto {
    private Long totalPlanQty;
    private Long totalGoodQty;
    private Long totalDefectQty;
    private Double yieldRate;
}



///1111111111