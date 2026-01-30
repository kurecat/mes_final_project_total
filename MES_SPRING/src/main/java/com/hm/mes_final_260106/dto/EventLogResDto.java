package com.hm.mes_final_260106.dto;

import com.hm.mes_final_260106.entity.ProductionLog;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class EventLogResDto {

    private LocalDateTime timestamp;
    private String level;
    private String category;
    private String message;


    public static EventLogResDto fromEntity(ProductionLog log) {
        return EventLogResDto.builder()
                .timestamp(log.getStartTime())
                .level(log.getLevel())
                .category(log.getCategory())
                .message(log.getMessage())
                .build();
    }
}
