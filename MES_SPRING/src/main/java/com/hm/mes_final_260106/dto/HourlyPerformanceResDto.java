package com.hm.mes_final_260106.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HourlyPerformanceResDto {
    private String time;   // "08:00"
    private Long plan;
    private Long actual;
    private Long scrap;
}

