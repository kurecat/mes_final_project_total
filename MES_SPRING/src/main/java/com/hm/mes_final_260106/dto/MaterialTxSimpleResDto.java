package com.hm.mes_final_260106.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialTxSimpleResDto {

    private Long id;
    private String createdAt;
    private String type;

    private String materialName;
    private Integer qty;
    private String location;
    private String worker;
}
