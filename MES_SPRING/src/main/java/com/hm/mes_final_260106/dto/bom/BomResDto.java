package com.hm.mes_final_260106.dto.bom;

import com.hm.mes_final_260106.constant.BomStatus;
import com.hm.mes_final_260106.constant.ItemType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BomResDto {
    private Long id;
    private String productCode;
    private String productName;
    private int revision;
    private BomStatus status;
    private LocalDateTime lastUpdate;
}
