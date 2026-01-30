package com.hm.mes_final_260106.dto.dashboard;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class HourlyProductionResDto {
    private String time; // "06:00"
    private int plan;
    private int actual;
}
