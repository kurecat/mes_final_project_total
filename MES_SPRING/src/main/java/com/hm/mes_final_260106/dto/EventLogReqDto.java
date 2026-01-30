package com.hm.mes_final_260106.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EventLogReqDto {
    private String level;
    private String message;
    private Long workerId;   // 선택
}
