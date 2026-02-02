// src/main/java/com/hm/mes_final_260106/dto/EquipmentDetailResDto.java
package com.hm.mes_final_260106.dto;

import com.hm.mes_final_260106.constant.EquipmentStatus;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentDetailResDto {

    private Long equipmentId;
    private String code;
    private String name;
    private String type;
    private String location;
    private EquipmentStatus status;
    private LocalDate installDate;

    // 현재 진행중인 작업(있으면)
    private CurrentRunInfo currentRun;

    // 최근 로그
    private List<EquipmentLogItem> recentLogs;

    // 실시간 데이터는 추후 주석 해제
    // private Double temperature;
    // private Double power;
    // private Integer uph;
    // private String errorCode;

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CurrentRunInfo {
        private Long productionLogId;
        private String lotCode;
        private String workOrderNumber;
        private String startTime;
    }

    @Getter @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EquipmentLogItem {
        private Long productionLogId;
        private String lotCode;
        private String workOrderNumber;
        private String startTime;
        private String endTime;
    }
}
///1111111111