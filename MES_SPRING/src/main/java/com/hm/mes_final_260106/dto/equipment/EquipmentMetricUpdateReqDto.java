package com.hm.mes_final_260106.dto.equipment;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentMetricUpdateReqDto {
    private String equipmentCode;   // 장비 ID
    private int uph;                // 시간당 웨이퍼 처리수
    private double temperature;     // 온도
    private int progress;           // 진행도 (0~100)

}
