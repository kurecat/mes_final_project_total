package com.hm.mes_final_260106.dto.equipment;

import com.hm.mes_final_260106.entity.EquipmentEventLog;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EquipmentEventLogPageResDto {

    private Long id;
    private String eventType;
    private String message;
    private String beforeValue;
    private String afterValue;
    private LocalDateTime createdAt;

    public static EquipmentEventLogPageResDto from(EquipmentEventLog e) {
        return EquipmentEventLogPageResDto.builder()
                .id(e.getId())
                .eventType(e.getEventType().name())
                .message(e.getMessage())
                .beforeValue(e.getBeforeValue())
                .afterValue(e.getAfterValue())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
