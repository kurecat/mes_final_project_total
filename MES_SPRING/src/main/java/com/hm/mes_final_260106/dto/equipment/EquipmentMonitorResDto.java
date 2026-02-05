package com.hm.mes_final_260106.dto.equipment;

import com.hm.mes_final_260106.constant.EquipmentStatus;
import com.hm.mes_final_260106.entity.Equipment;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentMonitorResDto {

    // ⭐ DB PK (삭제에 사용)
    private Long id;

    // ⭐ 설비 코드 (화면 표시/검색용)
    private String code;

    private String name;
    private String type;
    private EquipmentStatus status;
    private LocalDate installDate;

    // 모니터링 값 (DB에 없어도 됨)
    private String lotId;
    private int uph;
    private double temperature;
    private String param;
    private int progress;

    // DOWN일 때만 표시
    private String errorCode;

    public static EquipmentMonitorResDto fromEntity(Equipment e) {
        return EquipmentMonitorResDto.builder()
                .id(e.getId())          // ✅ Long id
                .code(e.getCode())      // ✅ String code
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