package com.hm.mes_final_260106.dto;

import com.hm.mes_final_260106.entity.EquipmentEventLog;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EquipmentEventLogResDto {

    private LocalDateTime time;
    private String type;
    private String message;

    public static EquipmentEventLogResDto from(EquipmentEventLog e) {
        return new EquipmentEventLogResDto(
                e.getCreatedAt(),
                e.getEventType().name(),
                e.getMessage()
        );
    }
}
