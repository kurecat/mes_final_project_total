package com.hm.mes_final_260106.dto.dashboard;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class EquipmentAlertResDto {
    private Long id;
    private String time;   // "14:25"
    private String equip;  // "Photo-02"
    private String msg;
    private String level;  // CRITICAL / WARN
}
