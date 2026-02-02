package com.hm.mes_final_260106.dto.material;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class MaterialResDto {
    private Long id;
    private String code;
    private String name;
    private String category;
    private Integer currentStock;
    private Integer safetyStock;
    private String location;
}