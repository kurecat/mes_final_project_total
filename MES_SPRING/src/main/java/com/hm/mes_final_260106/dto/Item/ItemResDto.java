package com.hm.mes_final_260106.dto.Item;

import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class ItemResDto {
    private Long id;
    private String serialNumber;
    private String productCode;
    private Long productionLogId;
    private String inspectionResult;
    private String location;
}