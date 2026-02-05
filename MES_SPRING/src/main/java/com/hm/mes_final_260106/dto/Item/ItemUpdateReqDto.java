package com.hm.mes_final_260106.dto.Item;

import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class ItemUpdateReqDto {
    private Long id;
    private String serialNumber;
    private String productCode;
    private Long ProductionLogId;
    private String inspectionResult;
    private String location;
}
///1111111111///1111111111