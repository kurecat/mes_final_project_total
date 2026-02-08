package com.hm.mes_final_260106.dto.defect;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor // [추가] JSON 파싱 시 기본 생성자 필요
@AllArgsConstructor // [추가] Builder 패턴 사용 시 필요
public class DefectLogDto {
    private Long id;
    private LocalDateTime endTime;
    private String processStep;
    private String message;
    private int defectQty;
    private int resultQty;
    private String workOrderNumber;
}