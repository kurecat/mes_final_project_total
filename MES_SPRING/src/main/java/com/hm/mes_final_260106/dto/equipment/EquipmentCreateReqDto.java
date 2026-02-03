package com.hm.mes_final_260106.dto.equipment;

import lombok.*;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentCreateReqDto {
    private String code;
    private String name;
    private String type;
    private String location;
    private LocalDate installDate;
}
