package com.hm.mes_final_260106.dto;

import lombok.Data;

@Data
public class WorkOrderStatusUpdateReqDto {
    private String status; // RELEASED, IN_PROGRESS, PAUSED, COMPLETED
}
