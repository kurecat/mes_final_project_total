// src/main/java/com/hm/mes_final_260106/repository/ProductionLogRepository.java
package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.entity.Equipment;
import com.hm.mes_final_260106.entity.ProductionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductionLogRepository extends JpaRepository<ProductionLog, Long> {

    // 진행중인 로그 (endTime null)
    Optional<ProductionLog> findFirstByEquipmentAndEndTimeIsNullOrderByStartTimeDesc(Equipment equipment);

    // 최근 로그 N개 (endTime 포함)
    List<ProductionLog> findTop10ByEquipmentOrderByStartTimeDesc(Equipment equipment);
}
