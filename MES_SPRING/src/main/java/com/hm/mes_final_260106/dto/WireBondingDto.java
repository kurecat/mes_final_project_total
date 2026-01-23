package com.hm.mes_final_260106.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WireBondingDto {

    private Long id;                // PK: 공정 ID
    private Long productionLogId;  // pk: ProductionLog 참조 (숫자만)

    private double bondingTemp;     // 본딩 온도 (℃)
    private double bondingForce;    // 본딩 압력 (gf)
    private double ultrasonicPower; // 초음파 출력 (mW)
    private double bondingTime;     // 본딩 시간 (ms)
    private double loopHeight;      // 루프 높이 (μm)
    private double ballDiameter;    // 볼 직경 (μm)
}
///1111111111