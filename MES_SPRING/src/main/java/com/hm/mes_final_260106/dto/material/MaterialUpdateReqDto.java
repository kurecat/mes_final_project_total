package com.hm.mes_final_260106.dto.material;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class MaterialUpdateReqDto {
    private String code;
    private String name;
    private String category;
    private String spec;
    private Integer currentStock;
    private Integer safetyStock;
    private String location;
}