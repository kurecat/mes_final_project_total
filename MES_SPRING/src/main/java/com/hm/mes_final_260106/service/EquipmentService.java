package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.dto.EquipmentDetailResDto;
import com.hm.mes_final_260106.dto.EquipmentMonitorResDto;
import com.hm.mes_final_260106.entity.Equipment;
import com.hm.mes_final_260106.entity.ProductionLog;
import com.hm.mes_final_260106.repository.EquipmentRepository;
import com.hm.mes_final_260106.repository.ProductionLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final ProductionLogRepository productionLogRepository;

    private final DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    // ✅ 모니터링 리스트 (MachinePage 카드용)
    public List<EquipmentMonitorResDto> getMonitoringList() {
        List<Equipment> list = equipmentRepository.findAll();

        return list.stream()
                .map(EquipmentMonitorResDto::fromEntity)
                .toList();
    }

    // ✅ 상세 모달 (equipmentCode 기반)
    public EquipmentDetailResDto getEquipmentDetail(String equipmentCode) {
        Equipment eq = equipmentRepository.findByCode(equipmentCode)
                .orElseThrow(() -> new IllegalArgumentException("Equipment not found: " + equipmentCode));

        // 진행중 로그
        ProductionLog runningLog = productionLogRepository
                .findFirstByEquipmentAndEndTimeIsNullOrderByStartTimeDesc(eq)
                .orElse(null);

        EquipmentDetailResDto.CurrentRunInfo currentRun = null;
        if (runningLog != null) {
            currentRun = EquipmentDetailResDto.CurrentRunInfo.builder()
                    .productionLogId(runningLog.getId())
                    .lotCode(runningLog.getLot() != null ? runningLog.getLot().getCode() : "-")
                    .workOrderNumber(
                            runningLog.getWorkOrder() != null
                                    ? runningLog.getWorkOrder().getWorkorderNumber()
                                    : "-"
                    )
                    .startTime(runningLog.getStartTime() != null ? runningLog.getStartTime().format(fmt) : "-")
                    .build();
        }

        // 최근 로그 10개
        List<EquipmentDetailResDto.EquipmentLogItem> recentLogs =
                productionLogRepository.findTop10ByEquipmentOrderByStartTimeDesc(eq)
                        .stream()
                        .map(log -> EquipmentDetailResDto.EquipmentLogItem.builder()
                                .productionLogId(log.getId())
                                .lotCode(log.getLot() != null ? log.getLot().getCode() : "-")
                                .workOrderNumber(
                                        log.getWorkOrder() != null
                                                ? log.getWorkOrder().getWorkorderNumber()
                                                : "-"
                                )
                                .startTime(log.getStartTime() != null ? log.getStartTime().format(fmt) : "-")
                                .endTime(log.getEndTime() != null ? log.getEndTime().format(fmt) : "-")
                                .build())
                        .toList();

        return EquipmentDetailResDto.builder()
                .equipmentId(eq.getId())
                .code(eq.getCode())
                .name(eq.getName())
                .type(eq.getType())
                .location(eq.getLocation())
                .status(eq.getStatus())
                .currentRun(currentRun)
                .recentLogs(recentLogs)
                .build();
    }
}
