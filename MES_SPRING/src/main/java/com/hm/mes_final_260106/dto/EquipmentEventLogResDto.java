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

    private Long id;
    private LocalDateTime time;
    private String type;
    private String message;

    public static EquipmentEventLogResDto from(EquipmentEventLog e) {
        return EquipmentEventLogResDto.builder()
                .id(e.getId())                 // 🔥 핵심
                .time(e.getCreatedAt())
                .type(e.getEventType().name())
                .message(e.getMessage())
                .build();
    }
}
