package com.hm.mes_final_260106.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter @Getter @AllArgsConstructor @NoArgsConstructor
public class FinalInspectionLogDto {
    private Long id;          // 최종검사 id
    private Long workOrderId; // WorkOrder 참조
    private Long itemId;      // Item 참조
    private Long memberId;    // Member 참조
    private Long equipmentId; // Equipment 참조
    private String electrical;// 전기적 검사 결과
    private String reliability;// 산뢰성 검사 결과
    private String visual;     // 외관 검사 결과
    private String finalPass;  // 최종합격 여부
}
