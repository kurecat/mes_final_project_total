package com.hm.mes_final_260106.dto.equipment;

import com.hm.mes_final_260106.constant.EquipmentStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentResDto {
    private Long id;
    private String code;
    private String name;
    private String type;
    private String location;
    private String status;
    private LocalDate installDate;
    private String errorCode;
    private LocalDateTime updatedAt;

}
