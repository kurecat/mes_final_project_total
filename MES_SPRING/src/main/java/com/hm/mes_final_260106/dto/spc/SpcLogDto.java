package com.hm.mes_final_260106.dto.spc;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpcLogDto {
    private String processName; // 예: DieBonding
    private String checkItem;   // 예: curingTemp
    private Double value;       // 예: 150.5 (숫자로 변환됨)
    private LocalDateTime time; // 측정 시간
}