package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.constant.EquipmentEventType;
import com.hm.mes_final_260106.constant.EquipmentStatus;
import com.hm.mes_final_260106.dto.*;
import com.hm.mes_final_260106.dto.equipment.EquipmentDetailResDto;
import com.hm.mes_final_260106.dto.equipment.EquipmentEventLogResDto;
import com.hm.mes_final_260106.dto.equipment.EquipmentMonitorResDto;
import com.hm.mes_final_260106.dto.equipment.EquipmentReqDto;
import com.hm.mes_final_260106.entity.Equipment;
import com.hm.mes_final_260106.entity.EquipmentEventLog;
import com.hm.mes_final_260106.entity.ProductionLog;
import com.hm.mes_final_260106.repository.EquipmentEventLogRepository;
import com.hm.mes_final_260106.repository.EquipmentRepository;
import com.hm.mes_final_260106.repository.ProductionLogRepository;
import lombok.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EquipmentService {

    private final EquipmentRepository equipmentRepo;
    private final ProductionLogRepository productionLogRepo;
    private final EquipmentEventLogRepository eventLogRepo;

    private final DateTimeFormatter fmt =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    // 장비별 실시간 데이터 저장소
    public static final ConcurrentHashMap<String, EquipmentMetrics> equipmentData = new ConcurrentHashMap<>();

    // 내부 데이터 구조
    @Getter @Setter @AllArgsConstructor @NoArgsConstructor
    public static class EquipmentMetrics {
        public int uph;        // 시간당 웨이퍼 처리수
        public double temperature; // 온도
        public int progress;      // 진행도 (0~100)
    }

    /* =====================================================
       공통: 상태 변경 로그 메시지 생성 (핵심)
       ===================================================== */
    private String buildStatusChangeMessage(
            EquipmentStatus before,
            EquipmentStatus after
    ) {
        if (before != EquipmentStatus.RUN && after == EquipmentStatus.RUN) {
            return "설비 가동 시작 (" + before + " → RUN)";
        }
        if (before == EquipmentStatus.RUN && after != EquipmentStatus.RUN) {
            return "설비 정지 (RUN → " + after + ")";
        }
        return "설비 상태 변경 (" + before + " → " + after + ")";
    }

    /* =====================================================
       모니터링 리스트 (MachinePage 카드)
       ===================================================== */
    public List<EquipmentMonitorResDto> getMonitoringList() {
        return equipmentRepo.findAll()
                .stream()
                .map(EquipmentMonitorResDto::fromEntity)
                .peek(dto -> {
                    EquipmentMetrics equipmentMetrics = equipmentData.get(dto.getCode());
                    if (equipmentMetrics == null) return;
                    dto.setUph(equipmentMetrics.getUph());
                    dto.setTemperature(equipmentMetrics.getTemperature());
                    dto.setProgress(equipmentMetrics.getProgress());
                })
                .toList();
    }

    /* =====================================================
       설비 상세 조회
       ===================================================== */
    public EquipmentDetailResDto getEquipmentDetail(String equipmentCode) {

        Equipment eq = equipmentRepo.findByCode(equipmentCode)
                .orElseThrow(() ->
                        new IllegalArgumentException("Equipment not found: " + equipmentCode));

        // 현재 진행 중 생산 로그
        ProductionLog runningLog =
                productionLogRepo
                        .findFirstByEquipmentAndEndTimeIsNullOrderByStartTimeDesc(eq)
                        .orElse(null);

        EquipmentDetailResDto.CurrentRunInfo currentRun = null;
        if (runningLog != null) {
            currentRun = EquipmentDetailResDto.CurrentRunInfo.builder()
                    .productionLogId(runningLog.getId())
                    .workOrderNumber(
                            runningLog.getWorkOrder() != null
                                    ? runningLog.getWorkOrder().getWorkOrderNumber()
                                    : "-"
                    )
                    .startTime(
                            runningLog.getStartTime() != null
                                    ? runningLog.getStartTime().format(fmt)
                                    : "-"
                    )
                    .build();
        }

        // 최근 생산 로그
        List<EquipmentDetailResDto.EquipmentLogItem> recentLogs =
                productionLogRepo.findTop10ByEquipmentOrderByStartTimeDesc(eq)
                        .stream()
                        .map(log ->
                                EquipmentDetailResDto.EquipmentLogItem.builder()
                                        .productionLogId(log.getId())
                                        .workOrderNumber(
                                                log.getWorkOrder() != null
                                                        ? log.getWorkOrder().getWorkOrderNumber()
                                                        : "-"
                                        )
                                        .startTime(
                                                log.getStartTime() != null
                                                        ? log.getStartTime().format(fmt)
                                                        : "-"
                                        )
                                        .endTime(
                                                log.getEndTime() != null
                                                        ? log.getEndTime().format(fmt)
                                                        : "-"
                                        )
                                        .build()
                        )
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

    /* =====================================================
       설비 생성
       ===================================================== */
    @Transactional
    public EquipmentResDto createEquipment(EquipmentCreateReqDto dto) {

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
                .location(dto.getLocation())
                .installDate(dto.getInstallDate())
                .build();

        equipmentRepo.save(eq);
        return new EquipmentResDto(eq);
    }

    /* =====================================================
       설비 삭제
       ===================================================== */
    @Transactional
    public void deleteEquipment(Long id) {
        if (!equipmentRepo.existsById(id)) {
            throw new RuntimeException("설비 없음 id=" + id);
        }
        eventLogRepo.deleteByEquipmentId(id);
        equipmentRepo.deleteById(id);
    }

    /* =====================================================
       설비 수정 (TYPE / STATUS 로그 기록)
       ===================================================== */
    @Transactional
    public EquipmentResDto updateEquipment(Long id, EquipmentReqDto dto) {

        Equipment equipment = equipmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found: " + id));

        EquipmentStatus beforeStatus = equipment.getStatus();
        EquipmentStatus newStatus = dto.getStatus();

        // TYPE 변경
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

        // STATUS 변경
        if (beforeStatus != newStatus) {

            String message = buildStatusChangeMessage(beforeStatus, newStatus);

            eventLogRepo.save(
                    EquipmentEventLog.builder()
                            .equipment(equipment)
                            .eventType(EquipmentEventType.STATUS_CHANGE)
                            .beforeValue(beforeStatus.name())
                            .afterValue(newStatus.name())
                            .message(message)
                            .createdAt(LocalDateTime.now())
                            .build()
            );

            equipment.setStatus(newStatus);
        }

        equipment.setName(dto.getName());
        equipment.setLocation(dto.getLocation());
        equipment.setInstallDate(dto.getInstallDate());

        return new EquipmentResDto(equipment);
    }

    /* =====================================================
       설비 상태 변경 (RUN / STOP 버튼)
       ===================================================== */
    @Transactional
    public void changeStatus(Long equipmentId, String statusValue) {

        EquipmentStatus newStatus = EquipmentStatus.from(statusValue);

        Equipment equipment = equipmentRepo.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("설비 없음"));

        EquipmentStatus before = equipment.getStatus();
        if (before == newStatus) return;

        equipment.setStatus(newStatus);

        String message = buildStatusChangeMessage(before, newStatus);

        eventLogRepo.save(
                EquipmentEventLog.builder()
                        .equipment(equipment)
                        .eventType(EquipmentEventType.STATUS_CHANGE)
                        .beforeValue(before.name())
                        .afterValue(newStatus.name())
                        .message(message)
                        .createdAt(LocalDateTime.now())
                        .build()
        );
    }

    /* =====================================================
       설비 이벤트 로그 조회 (설비 로그 페이지 / 상세 공용)
       ===================================================== */
    public List<EquipmentEventLogResDto> getEquipmentLogs(Long equipmentId) {
        return eventLogRepo
                .findByEquipmentIdOrderByCreatedAtDesc(equipmentId)
                .stream()
                .map(EquipmentEventLogResDto::from)
                .collect(Collectors.toList());
    }

    // 전체 설비 로그 (설비 로그 페이지)
    public List<EquipmentEventLogResDto> getAllEquipmentEventLogs() {
        return eventLogRepo
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(EquipmentEventLogResDto::from)
                .toList();
    }
    // 설비 로그 메세지 수정
    @Transactional
    public void updateEquipmentEventLogMessage(Long logId, String message) {

        EquipmentEventLog log = eventLogRepo.findById(logId)
                .orElseThrow(() ->
                        new RuntimeException("EquipmentEventLog not found: " + logId));

        log.setMessage(message);
        // JPA 더티체킹 → 자동 UPDATE
    }
}
