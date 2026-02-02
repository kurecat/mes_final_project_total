package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.dto.EquipmentAlertDto;
import com.hm.mes_final_260106.dto.dashboard.*;
import com.hm.mes_final_260106.repository.EquipmentRepository;
import com.hm.mes_final_260106.repository.ProductionLogRepository;
import com.hm.mes_final_260106.repository.ProductionResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.hm.mes_final_260106.constant.EquipmentStatus;

import java.time.LocalDate;
import java.util.*;


@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductionResultRepository productionResultRepo;
    private final EquipmentRepository equipmentRepo;
    private final ProductionLogRepository productionLogRepo;

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
    public List<HourlyProductionResDto> getHourlyProduction() {

        // 대시보드 화면과 동일한 타임 슬롯
        // (06,08,10,12,14,16,18)
        final List<Integer> slots = List.of(6, 8, 10, 12, 14, 16, 18);

        // 집계 범위는 최소~최대
        int startHour = 6;
        int endHour = 18;

        // 1) production_log에서 hour별 actual 조회
        List<Object[]> rows =
                productionLogRepo.findTodayHourlyCompletedOutput();

        // 2) hour -> actualQty 맵핑
        Map<Integer, Integer> actualByHour = new HashMap<>();
        for (Object[] r : rows) {
            Integer hour = (Integer) r[0];
            Number qty = (Number) r[1]; // Long/Integer 대비
            actualByHour.put(hour, qty.intValue());
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

    public List<WipBalanceResDto> getWipBalance() {

        List<Object[]> rows = productionLogRepo.findWipBalanceByProcess();

        return rows.stream()
                .map(r -> new WipBalanceResDto(
                        r[0].toString(),                 // process_step
                        ((Number) r[1]).longValue()     // sum(result_qty)
                ))
                .toList();
    }

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
