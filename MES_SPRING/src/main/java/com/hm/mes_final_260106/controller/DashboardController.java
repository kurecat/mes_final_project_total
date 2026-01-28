package com.hm.mes_final_260106.controller;

import com.hm.mes_final_260106.dto.dashboard.*;
import com.hm.mes_final_260106.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mes/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public DashboardSummaryResDto summary() {
        return dashboardService.getSummary();
    }

    @GetMapping("/hourly")
    public List<HourlyProductionResDto> hourly() {
        return dashboardService.getHourlyProduction();
    }

    @GetMapping("/wip")
    public List<WipBalanceResDto> wip() {
        return dashboardService.getWipBalance();
    }

    @GetMapping("/alerts")
    public List<EquipmentAlertResDto> alerts() {
        return dashboardService.getAlerts();
    }

    @PatchMapping("/alerts/{id}/ack")
    public void ack(@PathVariable Long id) {
        dashboardService.ackAlert(id);
    }


}
