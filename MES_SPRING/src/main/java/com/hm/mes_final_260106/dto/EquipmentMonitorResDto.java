package com.hm.mes_final_260106.dto;

import com.hm.mes_final_260106.entity.Equipment;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentMonitorResDto {

    // 프론트에서 쓰는 id (UI에서 EQ-PHO-01 같은 값)
    private String id;

    private String name;
    private String type;
    private String status;

    // 모니터링 값 (DB에 없어도 됨)
    private String lotId;
    private int uph;
    private double temperature;
    private String param;
    private int progress;

    // DOWN일 때만 표시
    private String errorCode;

    public static EquipmentMonitorResDto fromEntity(Equipment e) {
        // 기본값은 일단 임시로 생성 (나중에 production_log에서 가져오게 개선 가능)
        return EquipmentMonitorResDto.builder()
                .id(e.getCode())
                .name(e.getName())
                .type(e.getType())
                .status(e.getStatus())
                .lotId("-")
                .uph(0)
                .temperature(0.0)
                .param("-")
                .progress(0)
                .errorCode(null)
                .build();
    }
}
