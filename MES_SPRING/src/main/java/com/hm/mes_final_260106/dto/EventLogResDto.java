package com.hm.mes_final_260106.dto;

import com.hm.mes_final_260106.entity.EquipmentEventLog;
import com.hm.mes_final_260106.entity.ProductionLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class EventLogResDto {

    private Long id;                 // ⭐ ProductionLog.id (PK)
    private LocalDateTime timestamp; // startTime or endTime
    private String level;
    private String category;
    private String message;

    public static EventLogResDto from(ProductionLog pl) {
        return new EventLogResDto(
                pl.getId(),                // ⭐ 이거 절대 바꾸지 마
                pl.getStartTime(),
                "INFO",                    // 또는 pl.getLevel()
                "PRODUCTION",
                pl.getMessage()
        );
    }
}

