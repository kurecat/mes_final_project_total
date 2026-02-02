package com.hm.mes_final_260106.dto;

import com.hm.mes_final_260106.constant.EquipmentStatus;
import com.hm.mes_final_260106.entity.Equipment;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class EquipmentResDto {
    private Long id;
    private String code;
    private String name;
    private String type;
    private EquipmentStatus status;
    private LocalDate installDate;
    // private String lotId;
    // private Integer uph;
    // private Integer temperature;
    // private String param;

    public EquipmentResDto(Equipment e) {
        this.id = e.getId();
        this.code = e.getCode();
        this.name = e.getName();
        this.type = e.getType();
        this.status = e.getStatus();
        // this.lotId = e.getLotId();
        // this.uph = e.getUph();
        // this.temperature = e.getTemperature();
        // this.param = e.getParam();
    }
}
///1111111111