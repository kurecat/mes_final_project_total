package com.hm.mes_final_260106.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MoldingInspectionDto {

    private Long id;                    // PK
    private Long moldingId;             // FK: Molding 공정 참조
    private int sampleSize;             // 샘플링 수량
    private String inspectionCriteria;  // 검사 기준

    private double thicknessPassRatio;  // 두께 합격률 (%)
    private double voidPassRatio;       // 보이드(기포) 합격률 (%)
    private double crackPassRatio;      // 크랙(균열) 합격률 (%)
    private double overallPassRatio;    // 전체 합격률 (%)
}
