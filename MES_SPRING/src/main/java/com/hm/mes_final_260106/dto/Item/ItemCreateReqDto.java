package com.hm.mes_final_260106.dto.Item;

import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class ItemCreateReqDto {
    private Long id;
    private String serialNumber;
    private String inspectionResult;
}