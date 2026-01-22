package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.entity.LotMapping;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LotMappingRepository extends JpaRepository<LotMapping, Long> {
    // 특정 ProductionLog(생산이력)에 사용된 Lot 목록 조회
    List<LotMapping> findByProductionLogId(Long productionLogId);

    // 특정 Lot이 사용된 생산이력 조회 (역추적)
    List<LotMapping> findByLotId(Long lotId);
}
