package com.hm.mes_final_260106.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessLogDto {

    private Long id;            // PK

    // --- FK (Foreign Keys) ---
    // DB의 snake_case(_id)를 Java의 camelCase(Id)로 변환
    private Long workOrderId;   // WorkOrder 참조
    private Long lotId;         // Lot 참조
    private Long memberId;      // Member 참조
    private Long equipmentId;   // Equipment 참조

    // --- Time Fields ---
    private LocalDateTime startTime; // 시작 시간
    private LocalDateTime endTime;   // 종료 시간
}
///1111111111