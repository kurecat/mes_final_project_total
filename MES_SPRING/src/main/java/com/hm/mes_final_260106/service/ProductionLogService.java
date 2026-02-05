package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.dto.productionLog.ProductionLogCreateReqDto;
import com.hm.mes_final_260106.dto.productionLog.ProductionLogResDto;
import com.hm.mes_final_260106.entity.ProductionLog;
import com.hm.mes_final_260106.mapper.ProductionLogMapper;
import com.hm.mes_final_260106.repository.ProductionLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static java.util.stream.Collectors.toList;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductionLogService {

    private final ProductionLogRepository productionLogRepository;
    private final ProductionLogMapper productionLogMapper;

    // Create (생산 로그 보고)
    public ProductionLogResDto reportProduction(ProductionLogCreateReqDto dto) {
        ProductionLog productionLog = productionLogMapper.toEntity(dto);
        productionLogRepository.save(productionLog);
        return productionLogMapper.toResDto(productionLog);
    }

    // Read (전체 조회)
    @Transactional(readOnly = true)
    public List<ProductionLogResDto> getAllProductionLogs() {
        return productionLogMapper.toResDtoList(productionLogRepository.findAll());
    }

    // Read (단건 조회)
    @Transactional(readOnly = true)
    public ProductionLogResDto getProductionLogById(Long id) {
        ProductionLog productionLog = productionLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("생산 로그를 찾을 수 없습니다. id=" + id));
        return productionLogMapper.toResDto(productionLog);
    }

    // Delete
    public void deleteProductionLog(Long id) {
        if (!productionLogRepository.existsById(id)) {
            throw new RuntimeException("삭제할 생산 로그가 존재하지 않습니다. id=" + id);
        }
        productionLogRepository.deleteById(id);
    }
}