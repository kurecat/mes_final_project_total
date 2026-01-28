package com.hm.mes_final_260106.dto.dashboard;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class WipBalanceResDto {
    private String step; // PHOTO / ETCH ...
    private long count;
}
