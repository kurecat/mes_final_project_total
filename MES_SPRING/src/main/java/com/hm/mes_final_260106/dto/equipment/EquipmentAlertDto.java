package com.hm.mes_final_260106.dto.equipment;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EquipmentAlertDto {

    private String time;      // HH:mm
    private String equip;     // Photo-02
    private String level;     // CRITICAL
    private String message;   // Error message
}
