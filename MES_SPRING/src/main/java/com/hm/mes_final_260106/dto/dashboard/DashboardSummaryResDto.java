package com.hm.mes_final_260106.dto.dashboard;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardSummaryResDto {
    private int waferOut;
    private double waferOutTrend;
    private double yield;
    private double yieldTrend;
    private double utilization;
    private double utilizationTrend;
    private int issues;
}
