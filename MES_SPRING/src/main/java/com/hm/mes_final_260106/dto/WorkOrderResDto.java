package com.hm.mes_final_260106.dto;
// 작업 지시에 대한 응답 : 서버가 처리한 결과물을 '외부에 보여주기 위한 형태'로 가공한 데이터 객체

import com.hm.mes_final_260106.entity.Product;
import com.hm.mes_final_260106.entity.WorkOrder;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class WorkOrderResDto {
    private Long id;
    private String workOrderNumber;   // work_order_number
    private String productId;
    private int targetQty;
    private int currentQty;
    private String status;
    private String targetLine;
    private String assignedMachineId;

    private LocalDateTime startDate; // start_date
    private LocalDateTime endDate;   // end_date

    // Entity -> DTO 변환
    public static WorkOrderResDto fromEntity(WorkOrder workOrder) {
        return WorkOrderResDto.builder()
                .id(workOrder.getId())
                .workOrderNumber(workOrder.getWorkOrderNumber())
                .productId(workOrder.getProduct().getCode())
                .targetQty(workOrder.getTargetQty())
                .currentQty(workOrder.getCurrentQty())
                .status(workOrder.getStatus())
                .targetLine(workOrder.getTargetLine())
                .assignedMachineId(workOrder.getAssignedMachineId())
                .startDate(workOrder.getStartDate())
                .endDate(workOrder.getEndDate())
                .build();
    }
}