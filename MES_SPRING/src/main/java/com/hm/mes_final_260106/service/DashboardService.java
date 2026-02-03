package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.dto.EquipmentAlertDto;
import com.hm.mes_final_260106.dto.dashboard.*;
import com.hm.mes_final_260106.repository.EquipmentRepository;
import com.hm.mes_final_260106.repository.ProductionLogRepository;
import com.hm.mes_final_260106.repository.ProductionResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.hm.mes_final_260106.constant.EquipmentStatus;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductionResultRepository productionResultRepo;
    private final EquipmentRepository equipmentRepo;
    private final ProductionLogRepository productionLogRepo;

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
        double utilization = totalEquip == 0 ? 0 : (runningEquip * 100.0 / totalEquip);

        int issues = equipmentRepo.countByStatus(EquipmentStatus.DOWN);

        return DashboardSummaryResDto.builder()
                .waferOut(todayOut)
                .waferOutTrend(waferTrend)
                .yield(round1(todayYield))
                .yieldTrend(yieldTrend)
                .utilization(round1(utilization))
                .utilizationTrend(0) // 보류
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

    // ===== 데이터 (백엔드 즉시 적용) =====
    @Transactional(readOnly = true)
    public List<HourlyProductionResDto> getHourlyProduction() {

        // 대시보드 화면과 동일한 타임 슬롯
        // (06,08,10,12,14,16,18)
        final List<Integer> slots = List.of(6, 8, 10, 12, 14, 16, 18);

        // 1) production_log에서 hour별 actual 조회
        List<Object[]> rows = productionLogRepo.findTodayHourlyCompletedOutput();

        // 2) hour -> actualQty 맵핑
        Map<Integer, Integer> actualByHour = new HashMap<>();
        if (rows != null) {
            for (Object[] r : rows) {
                if (r[0] != null && r[1] != null) {
                    Integer hour = (Integer) r[0];
                    Number qty = (Number) r[1];
                    actualByHour.put(hour, qty.intValue());
                }
            }
        }

        // 3) 슬롯 기준으로 DTO 생성
        List<HourlyProductionResDto> result = new ArrayList<>();
        for (Integer h : slots) {
            // ✅ plan은 아직 실제 테이블 연동 전이므로 임시값 유지
            int plan = switch (h) {
                case 6 -> 400;
                case 8 -> 450;
                case 10 -> 500;
                case 12 -> 400;
                case 14 -> 500;
                case 16 -> 500;
                case 18 -> 450;
                default -> 0;
            };

            int actual = actualByHour.getOrDefault(h, 0);

            result.add(new HourlyProductionResDto(
                    String.format("%02d:00", h),
                    plan,
                    actual
            ));
        }

        return result;
    }

    @Transactional(readOnly = true)
    public List<WipBalanceResDto> getWipBalance() {

        List<Object[]> rows = productionLogRepo.findWipBalanceByProcess();

        if (rows == null) {
            return Collections.emptyList();
        }

        return rows.stream()
                .map(r -> new WipBalanceResDto(
                        // ▼ [수정] r[0]이 NULL일 경우 "Unknown" 등으로 처리 (NullPointerException 방지)
                        (r[0] != null) ? r[0].toString() : "Unknown",

                        // ▼ [수정] r[1]이 NULL일 경우 0으로 처리
                        (r[1] != null) ? ((Number) r[1]).longValue() : 0L
                ))
                .collect(Collectors.toList());
    }

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
        // 다음 단계: alarm 테이블 연동
    }
}