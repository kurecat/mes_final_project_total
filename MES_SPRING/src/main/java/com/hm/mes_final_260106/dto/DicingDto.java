package com.hm.mes_final_260106.dto;

import lombok.*;

@Setter@Getter @AllArgsConstructor
@NoArgsConstructor
@Builder
public class DicingDto {
    private Long id;  // pk
    private Long productionLogId;  // pk: ProductionLog 참조 (숫자만)
    private int spindleSpeed;  // 스핀들 회전 속도
    private double feedRate;   // 이송 속도 (mm/s)
    private double bladeWear;  // 블레이드 마모율 (%)
    private double coolantFlow; // 냉각수 유량 (L/min)
///1111111111
}
