package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.dto.defect.DefectLogDto;
import com.hm.mes_final_260106.entity.Item;
import com.hm.mes_final_260106.entity.ProductionResult;
import com.hm.mes_final_260106.repository.ProductionResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DefectService {

    // [변경] ProductionLogRepository -> ProductionResultRepository
    private final ProductionResultRepository productionResultRepository;

    public List<DefectLogDto> getDefectLogs() {
        // [변경] ProductionResult 테이블에서 불량이 0개보다 큰 기록 조회
        // (ProductionResultRepository에 findByDefectQtyGreaterThan 메서드가 있어야 합니다)
        List<ProductionResult> defectResults = productionResultRepository.findByDefectQtyGreaterThan(0);

        return defectResults.stream()
                .map(result -> DefectLogDto.builder()
                        .id(result.getId())
                        // [매핑] endTime -> 실적 생성 시간 (createdAt)
                        .endTime(result.getCreatedAt())
                        // [매핑] processStep -> 라인 정보 (line)로 대체
                        .processStep(result.getLine())
                        // [매핑] message -> 제품명 + 불량 메시지로 대체 (상세 사유가 없으므로)
                        .message(result.getProduct().getName() + " 불량 발생")
                        .defectQty(result.getDefectQty())
                        // [매핑] resultQty -> 양품 수량 (goodQty)
                        .resultQty(result.getGoodQty())
                        // [매핑] workOrderNumber -> 작업지시가 없으므로 제품 코드(Code)로 대체
                        .workOrderNumber(result.getProduct().getCode())
                        .build())
                .sorted((a, b) -> b.getId().compareTo(a.getId())) // 최신순 정렬
                .collect(Collectors.toList());
    }
}