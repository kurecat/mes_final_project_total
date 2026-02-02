package com.hm.mes_final_260106.dto.material;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class MaterialUpdateReqDto {
    private String name;
    private String category;
    private Integer currentStock;
    private Integer safetyStock;
    private String location;
}