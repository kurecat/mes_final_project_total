package com.hm.mes_final_260106.dto;

import com.hm.mes_final_260106.entity.Product;
import com.hm.mes_final_260106.entity.WorkOrder;
import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class ItemDto {
    private Long id;
    private String serialNumber;
    private Product product;
    private Long ProductionLogId;
    private String inspectionResult;
    private String location;
}
///1111111111///1111111111