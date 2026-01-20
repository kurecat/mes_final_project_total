package com.hm.mes_final_260106.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter@Getter@AllArgsConstructor@NoArgsConstructor
public class DieBondingDto {
    private Long id;          // PK
    private Long productionLogId;  // pk: ProductionLog 참조 (숫자만)
    private double pickUpForce;  // 픽업 힘
    private double placementAccuracy;   // 배치 정확도
    private double epoxyDispenseVolume; // 에폭시 도포량
    private double curingTemp;       // 경화 온도
}
