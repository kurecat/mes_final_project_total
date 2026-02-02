package com.hm.mes_final_260106.dto;

import com.hm.mes_final_260106.constant.EquipmentStatus;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentCreateReqDto {
    private String code;        // EQ-PHO-01 같은 설비 코드
    private String name;
    private String type;
    private EquipmentStatus status;
    private String location;
    private String lotId;
    private LocalDate installDate;
    private Integer uph;
    private Double temperature;
    private String param;
}
///1111111111