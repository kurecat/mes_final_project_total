package com.hm.mes_final_260106.dto.lot;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LotHistoryResDto {
    private String stepName;    // 공정명 (예: DICING, BONDING)
    private String status;      // 상태 (DONE, RUNNING)
    private LocalDateTime time; // 작업 시간 (Start or End Time)
    private String worker;      // 작업자 이름
    private String result;      // 결과 요약 (예: "Good: 100 / Defect: 0")
}