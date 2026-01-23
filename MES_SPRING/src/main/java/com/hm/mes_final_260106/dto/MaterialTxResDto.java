package com.hm.mes_final_260106.dto;

import com.hm.mes_final_260106.constant.MaterialTxType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialTxResDto {

    private Long txId;
    private LocalDateTime time;
    private MaterialTxType type;

    private String materialName;
    private Integer qty;
    private String unit;

    private String targetLocation;
    private String targetEquipment;

    private String workerName;
}
///1111111111