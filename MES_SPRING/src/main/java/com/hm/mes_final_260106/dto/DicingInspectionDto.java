package com.hm.mes_final_260106.dto;

import lombok.*;

@Setter@Getter @AllArgsConstructor
@NoArgsConstructor @Builder
public class DicingInspectionDto {
    private Long id;        // PK
    private Long dicId;      // FK: Dicing 공정 참조 (숫자만)
    private int sampleSize; // 샘플링 수량 (EA)
    private String inspectionCriteria;  // 검사 기준
    private double thicknessPassRatio;  // 두께 합격률 (%)
    private double chippingPassRatio;   // 칩핑 합격률 (%)
    private double overallPassRatio;    // 전체 합격률 (%)
}
///1111111111