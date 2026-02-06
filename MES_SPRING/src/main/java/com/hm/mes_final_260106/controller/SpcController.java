package com.hm.mes_final_260106.controller;

import com.hm.mes_final_260106.dto.SpcLogDto;
import com.hm.mes_final_260106.entity.InspectionStandard;
import com.hm.mes_final_260106.service.SpcService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/mes/quality")
@RequiredArgsConstructor
public class SpcController {

    private final SpcService spcService; // 서비스를 주입받음

    @GetMapping("/standard")
    public List<InspectionStandard> getStandards() {
        return spcService.getStandards();
    }

    @GetMapping("/spc")
    public List<SpcLogDto> getSpcData() {
        // 복잡한 로직 없이 서비스 호출 한 방으로 끝!
        return spcService.getAllSpcData();
    }
}