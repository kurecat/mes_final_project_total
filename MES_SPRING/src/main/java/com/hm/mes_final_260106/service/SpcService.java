package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.dto.SpcLogDto;
import com.hm.mes_final_260106.entity.*;
import com.hm.mes_final_260106.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator; // 👈 [필수 추가] 이거 없으면 에러나요!
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SpcService {

    private final InspectionStandardRepository standardRepository;
    private final DieBondingRepository dieBondingRepository;
    private final MoldingRepository moldingRepository;
    private final WireBondingRepository wireBondingRepository;

    public List<InspectionStandard> getStandards() {
        return standardRepository.findAll();
    }

    public List<SpcLogDto> getAllSpcData() {
        List<SpcLogDto> result = new ArrayList<>();

        // 1. DieBonding
        List<DieBonding> dbList = dieBondingRepository.findAll();
        for (DieBonding db : dbList) {
            LocalDateTime time = getSafeTime(db.getProductionLog());
            addLogForce(result, "DieBonding", "curingTemp", db.getCuringTemp(), time);
            addLogForce(result, "DieBonding", "pickUpForce", db.getPickUpForce(), time);
        }

        // 2. Molding
        List<Molding> mdList = moldingRepository.findAll();
        for (Molding md : mdList) {
            LocalDateTime time = getSafeTime(md.getProductionLog());
            addLogForce(result, "Molding", "moldTemp", md.getMoldTemp(), time);
            addLogForce(result, "Molding", "injectionPressure", md.getInjectionPressure(), time);
        }

        // 3. WireBonding
        List<WireBonding> wbList = wireBondingRepository.findAll();
        for (WireBonding wb : wbList) {
            LocalDateTime time = getSafeTime(wb.getProductionLog());
            addLogForce(result, "WireBonding", "bondingTemp", wb.getBondingTemp(), time);
            addLogForce(result, "WireBonding", "bondingForce", wb.getBondingForce(), time);
        }

        // ✅ [핵심 해결] 시간 순서대로 정렬 (과거 -> 미래)
        // 이 코드가 있어야 4시 41분 데이터부터 차례대로 그려집니다.
        result.sort(Comparator.comparing(SpcLogDto::getTime));

        log.info("📊 [SPC] 총 데이터 개수: " + result.size());
        return result;
    }

    // ... (나머지 private 메서드들은 그대로 두세요) ...
    private LocalDateTime getSafeTime(ProductionLog log) {
        if (log == null) return LocalDateTime.now();
        if (log.getEndTime() != null) return log.getEndTime();
        if (log.getStartTime() != null) return log.getStartTime();
        return LocalDateTime.now();
    }

    private void addLogForce(List<SpcLogDto> list, String process, String item, String valStr, LocalDateTime time) {
        double val = 0.0;
        try {
            if (valStr != null) {
                String safeNum = valStr.replaceAll("[^0-9.]", "");
                if (!safeNum.isEmpty()) {
                    val = Double.parseDouble(safeNum);
                }
            }
        } catch (Exception e) {
            val = 0.0;
        }

        list.add(SpcLogDto.builder()
                .processName(process)
                .checkItem(item)
                .value(val)
                .time(time)
                .build());
    }
}