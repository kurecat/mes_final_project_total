package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.constant.EquipmentStatus;
import com.hm.mes_final_260106.dto.dashboard.*;
import com.hm.mes_final_260106.dto.equipment.EquipmentAlertDto;
import com.hm.mes_final_260106.entity.WorkOrder;
import com.hm.mes_final_260106.repository.EquipmentRepository;
import com.hm.mes_final_260106.repository.ProductionLogRepository;
import com.hm.mes_final_260106.repository.ProductionResultRepository;
import com.hm.mes_final_260106.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductionResultRepository productionResultRepo;
    private final EquipmentRepository equipmentRepo;
    private final ProductionLogRepository productionLogRepo;
    private final WorkOrderRepository workorderRepo;

    /* ================= KPI SUMMARY ================= */

    @Transactional(readOnly = true)
    public DashboardSummaryResDto getSummary() {

        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        int todayOut = productionResultRepo.sumOutputByDate(today);
        int yesterdayOut = productionResultRepo.sumOutputByDate(yesterday);
        double waferTrend = trend(todayOut, yesterdayOut);

        double todayYield = productionResultRepo.avgYieldByDate(today);
        double yesterdayYield = productionResultRepo.avgYieldByDate(yesterday);
        double yieldTrend = trend(todayYield, yesterdayYield);

        int totalEquip = (int) equipmentRepo.count();
        int runningEquip = equipmentRepo.countByStatus(EquipmentStatus.RUN);
        double utilization = totalEquip == 0
                ? 0
                : (runningEquip * 100.0 / totalEquip);

        int issues = equipmentRepo.countByStatus(EquipmentStatus.DOWN);

        return DashboardSummaryResDto.builder()
                .waferOut(todayOut)
                .waferOutTrend(waferTrend)
                .yield(round1(todayYield))
                .yieldTrend(yieldTrend)
                .utilization(round1(utilization))
                .utilizationTrend(0) // TODO 추후 계산
                .issues(issues)
                .build();
    }

    private double trend(double today, double yesterday) {
        if (yesterday == 0) return 0;
        return round1((today - yesterday) / yesterday * 100);
    }

    private double round1(double v) {
        return Math.round(v * 10) / 10.0;
    }

    /* ================= HOURLY PRODUCTION ================= */

    @Transactional(readOnly = true)
    public List<HourlyProductionResDto> getHourlyProduction() {

        // 대시보드와 동일한 시간 슬롯
        final List<Integer> slots = List.of(6, 8, 10, 12, 14, 16, 18);

        /* ---------- 1) actual (실적) ---------- */
        List<Object[]> rows = productionLogRepo.findTodayHourlyCompletedOutput();

        Map<Integer, Integer> actualByHour = new HashMap<>();
        if (rows != null) {
            for (Object[] r : rows) {
                if (r[0] != null && r[1] != null) {
                    Integer hour = ((Number) r[0]).intValue();
                    Integer qty  = ((Number) r[1]).intValue();
                    actualByHour.put(hour, qty);
                }
            }
        }

        /* ---------- 2) plan (계획) : WorkOrder 기반 ---------- */
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);

        List<WorkOrder> workOrders =
                workorderRepo.findByStartDateBetween(startOfDay, endOfDay);

        Map<Integer, Integer> planByHour = new HashMap<>();

        for (WorkOrder wo : workOrders) {

            LocalDateTime woStart = wo.getStartDate();
            LocalDateTime woEnd = (wo.getEndDate() != null)
                    ? wo.getEndDate()
                    : woStart.plusHours(12); // 안전장치

            long totalHours = ChronoUnit.HOURS.between(woStart, woEnd);
            if (totalHours <= 0) continue;

            int hourlyPlan = wo.getTargetQty() / (int) totalHours;

            for (Integer h : slots) {
                if (h >= woStart.getHour() && h < woEnd.getHour()) {
                    planByHour.merge(h, hourlyPlan, Integer::sum);
                }
            }
        }

        /* ---------- 3) DTO 생성 ---------- */
        List<HourlyProductionResDto> result = new ArrayList<>();

        for (Integer h : slots) {

            int plan = planByHour.getOrDefault(h, 0);
            int actual = actualByHour.getOrDefault(h, 0);

            result.add(new HourlyProductionResDto(
                    String.format("%02d:00", h),
                    plan,
                    actual
            ));
        }

        return result;
    }

    /* ================= WIP BALANCE ================= */

    @Transactional(readOnly = true)
    public List<WipBalanceResDto> getWipBalance() {
        List<Object[]> rows = productionLogRepo.findWipBalanceByProcess();

        if (rows == null) {
            return Collections.emptyList();
        }

        return rows.stream()
                .map(r -> {
                    String rawStep = (r[0] != null) ? r[0].toString() : "Unknown";
                    long count = (r[1] != null) ? ((Number) r[1]).longValue() : 0L;

                    // 1. 공정 명칭 변경 (원하는 한글/영문명으로 매핑)
                    String mappedStep = switch (rawStep.toUpperCase()) {
                        case "PHOTO" -> "DICING";
                        case "ETCH" -> "DieBonding";
                        case "CMP" -> "WireBonding";
                        case "CLEAN" -> "Molding"; // 4번째 공정 예시
                        case "UNKNOWN" -> "기타";
                        default -> rawStep;
                    };

                    return new WipBalanceResDto(mappedStep, count);
                })
                // 2. 수치가 너무 적거나(예: 0개) '기타' 항목을 숨기고 싶다면 필터링 추가
                .filter(dto -> dto.getCount() > 0 && !dto.getStep().equals("기타"))
                .collect(Collectors.toList());
    }
    /* ================= REALTIME ALERT ================= */

    @Transactional(readOnly = true)
    public List<EquipmentAlertDto> getRealtimeEquipmentAlerts() {

        return equipmentRepo
                .findByStatusOrderByUpdatedAtDesc(EquipmentStatus.DOWN)
                .stream()
                .map(e -> new EquipmentAlertDto(
                        e.getUpdatedAt() != null
                                ? e.getUpdatedAt().toLocalTime().toString()
                                : "--:--",
                        e.getName(),
                        "CRITICAL",
                        e.getErrorCode() != null
                                ? e.getErrorCode()
                                : "Equipment Down"
                ))
                .toList();
    }

    public void ackAlert(Long id) {
        // TODO alarm 테이블 연동
    }
}
