package com.hm.mes_final_260106.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WireBondingInspectionDto {

    private Long id;                    // PK
    private Long wireBondingId;         // FK: WireBonding 공정 참조
    private int sampleSize;             // 샘플링 수량
    private String inspectionCriteria;  // 검사 기준

    private double pullTestPassRatio;   // 풀 테스트 합격률 (%)
    private double shearTestPassRatio;  // 전단 테스트 합격률 (%)
    private double xrayPassRatio;       // X-ray 검사 합격률 (%)
    private double overallPassRatio;    // 전체 합격률 (%)
}
///1111111111