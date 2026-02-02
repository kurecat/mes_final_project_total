package com.hm.mes_final_260106.dto;

import com.hm.mes_final_260106.constant.EquipmentStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter
public class EquipmentReqDto {
    private String code;
    private String name;
    private String type;
    private EquipmentStatus status;
    private String location;
    private LocalDate installDate;
    private String lotId;
    private Integer uph;
    private Integer temperature;
    private String param;
}
///1111111111