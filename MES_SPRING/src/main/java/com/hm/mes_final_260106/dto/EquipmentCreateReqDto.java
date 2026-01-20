package com.hm.mes_final_260106.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentCreateReqDto {
    private String code;        // EQ-PHO-01 같은 설비 코드
    private String name;
    private String type;
    private String status;
    private String location;
    private String lotId;
    private Integer uph;
    private Double temperature;
    private String param;
}
