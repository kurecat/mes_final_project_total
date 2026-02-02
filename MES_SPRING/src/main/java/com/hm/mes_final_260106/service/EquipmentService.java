package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.constant.EquipmentEventType;
import com.hm.mes_final_260106.constant.EquipmentStatus;
import com.hm.mes_final_260106.dto.*;
import com.hm.mes_final_260106.entity.Equipment;
import com.hm.mes_final_260106.entity.EquipmentEventLog;
import com.hm.mes_final_260106.entity.ProductionLog;
import com.hm.mes_final_260106.repository.EquipmentEventLogRepository;
import com.hm.mes_final_260106.repository.EquipmentRepository;
import com.hm.mes_final_260106.repository.ProductionLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EquipmentService {

    private final EquipmentRepository equipmentRepo;
    private final ProductionLogRepository productionLogRepo;
    private final EquipmentEventLogRepository eventLogRepo;

    private final DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    // ✅ 모니터링 리스트 (MachinePage 카드용)
    public List<EquipmentMonitorResDto> getMonitoringList() {
        List<Equipment> list = equipmentRepo.findAll();

        return list.stream()
                .map(EquipmentMonitorResDto::fromEntity)
                .toList();
    }

    // ✅ 상세 모달 (equipmentCode 기반)
    public EquipmentDetailResDto getEquipmentDetail(String equipmentCode) {
        Equipment eq = equipmentRepo.findByCode(equipmentCode)
                .orElseThrow(() -> new IllegalArgumentException("Equipment not found: " + equipmentCode));

        // 진행중 로그
        ProductionLog runningLog = productionLogRepo
                .findFirstByEquipmentAndEndTimeIsNullOrderByStartTimeDesc(eq)
                .orElse(null);

        EquipmentDetailResDto.CurrentRunInfo currentRun = null;
        if (runningLog != null) {
            currentRun = EquipmentDetailResDto.CurrentRunInfo.builder()
                    .productionLogId(runningLog.getId())
//                    .lotCode(runningLog.getLot() != null ? runningLog.getLot().getCode() : "-")
                    .workOrderNumber(
                            runningLog.getWorkOrder() != null
                                    ? runningLog.getWorkOrder().getWorkOrderNumber()
                                    : "-"
                    )
                    .startTime(runningLog.getStartTime() != null ? runningLog.getStartTime().format(fmt) : "-")
                    .build();
        }

        // 최근 로그 10개
        List<EquipmentDetailResDto.EquipmentLogItem> recentLogs =
                productionLogRepo.findTop10ByEquipmentOrderByStartTimeDesc(eq)
                        .stream()
                        .map(log -> EquipmentDetailResDto.EquipmentLogItem.builder()
                                .productionLogId(log.getId())
//                                .lotCode(log.getLot() != null ? log.getLot().getCode() : "-")
                                .workOrderNumber(
                                        log.getWorkOrder() != null
                                                ? log.getWorkOrder().getWorkOrderNumber()
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

    // =====================================================
    // ✅ 설비 추가 저장 (Add Equipment -> Save -> DB INSERT)
    // =====================================================
    @Transactional
    public EquipmentResDto createEquipment(EquipmentCreateReqDto dto) {

        // code 중복 방지 (프론트에서 code를 만들어 보내는 구조일 때)
        if (dto.getCode() == null || dto.getCode().isBlank()) {
            throw new IllegalArgumentException("Equipment code is required.");
        }

        if (equipmentRepo.existsByCode(dto.getCode())) {
            throw new IllegalArgumentException("Equipment code already exists: " + dto.getCode());
        }

        Equipment eq = Equipment.builder()
                .code(dto.getCode())
                .name(dto.getName())
                .type(dto.getType())
                .status(dto.getStatus())
                .location(dto.getLocation())// dto에 있으면 넣고, 없으면 null 가능
                .installDate(dto.getInstallDate())
                .build();

        equipmentRepo.save(eq);
        return null;
    }
    @Transactional
    public void deleteEquipment(Long id) {
        if (!equipmentRepo.existsById(id)) {
            throw new RuntimeException("해당 설비가 존재하지 않습니다. id=" + id);
        }
        eventLogRepo.deleteByEquipmentId(id);
        equipmentRepo.deleteById(id);
    }

    @Transactional
    public EquipmentResDto updateEquipment(Long id, EquipmentReqDto dto) {

        Equipment equipment = equipmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found : " + id));


        // DTO가 Enum이므로 그대로 사용
        EquipmentStatus newStatus = dto.getStatus();

    /* =========================
       TYPE 변경
       ========================= */
        if (!equipment.getType().equals(dto.getType())) {

            eventLogRepo.save(
                    EquipmentEventLog.builder()
                            .equipment(equipment)
                            .eventType(EquipmentEventType.TYPE_CHANGE)
                            .beforeValue(equipment.getType())
                            .afterValue(dto.getType())
                            .message(equipment.getType() + " → " + dto.getType())
                            .createdAt(LocalDateTime.now())
                            .build()
            );

            equipment.setType(dto.getType());
        }

    /* =========================
       STATUS 변경
       ========================= */
        if (equipment.getStatus() != newStatus) {

            eventLogRepo.save(
                    EquipmentEventLog.builder()
                            .equipment(equipment)
                            .eventType(EquipmentEventType.STATUS_CHANGE)
                            .beforeValue(equipment.getStatus().name())
                            .afterValue(newStatus.name())
                            .message(equipment.getStatus() + " → " + newStatus)
                            .createdAt(LocalDateTime.now())
                            .build()
            );

            equipment.setStatus(newStatus);
        }
        equipment.setName(dto.getName());
        equipment.setLocation(dto.getLocation());
        equipment.setInstallDate(dto.getInstallDate());

//        equipment.setLotId(dto.getLotId());
//        equipment.setUph(dto.getUph());
//        equipment.setTemperature(dto.getTemperature());
//        equipment.setParam(dto.getParam());

        // JPA 더티체킹으로 자동 UPDATE 반영됨
        return new EquipmentResDto(equipment);
    }

// 설비상태변경 로직
@Transactional
public void changeStatus(Long id, EquipmentStatus nextStatus) {

    Equipment eq = equipmentRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("설비를 찾을 수 없습니다"));

    EquipmentStatus current = eq.getStatus();

    if (!isValidTransition(current, nextStatus)) {
        throw new IllegalStateException(
                "Invalid transition: " + current + " → " + nextStatus
        );
    }

    eq.setStatus(nextStatus);
    eq.setUpdatedAt(LocalDateTime.now());

    if (nextStatus == EquipmentStatus.DOWN) {
        eq.setErrorCode("E-DOWN");
    }

    if (nextStatus == EquipmentStatus.RUN) {
        eq.setErrorCode(null);
    }
}

    private boolean isValidTransition(EquipmentStatus current, EquipmentStatus next) {
        return switch (current) {
            case RUN -> next == EquipmentStatus.DOWN;
            case IDLE, DOWN -> next == EquipmentStatus.RUN;
        };
    }

}
