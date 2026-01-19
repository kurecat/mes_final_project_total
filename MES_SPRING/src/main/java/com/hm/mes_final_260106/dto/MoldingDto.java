package com.hm.mes_final_260106.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MoldingDto {

    private Long id;                // PK: 공정 ID
    private Long productionLogId;  // pk: ProductionLog 참조 (숫자만)
    private double moldTemp;        // 몰드 온도 (℃)
    private double injectionPressure; // 수지 주입 압력 (bar)
    private double cureTime;        // 경화 시간 (s)
    private double clampForce;      // 클램프 압력 (kN)
}