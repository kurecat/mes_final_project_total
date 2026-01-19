package com.hm.mes_final_260106.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter@Getter@NoArgsConstructor@AllArgsConstructor
public class DieBondingInspectionDto {
    private Long id;            // PK
    private Long dieBondingId;  // FK: DieBonding 공정 참조
    private int sampleSize;     // 샘플링 수량
    private String inspectionCriteria;  // 검사 기준
    private double alignmentPassRatio;  // 정렬 합격률
    private double voidPassRatio;       // 보이드 합격률
    private double overallPassRatio;    // 전체 합격률
}
