// src/main/java/com/hm/mes_final_260106/repository/ProductionLogRepository.java
package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.entity.Equipment;
import com.hm.mes_final_260106.entity.ProductionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductionLogRepository extends JpaRepository<ProductionLog, Long> {

    // 진행중인 로그 (endTime null)
    Optional<ProductionLog> findFirstByEquipmentAndEndTimeIsNullOrderByStartTimeDesc(Equipment equipment);

    // 최근 로그 N개 (endTime 포함)
    List<ProductionLog> findTop10ByEquipmentOrderByStartTimeDesc(Equipment equipment);

    // 이벤트 로그만 조회
    List<ProductionLog> findByMessageIsNotNullOrderByStartTimeDesc();
    @Query("""
    SELECT
        HOUR(pl.endTime) AS hour,
        SUM(pl.resultQty) AS totalQty
    FROM ProductionLog pl
    WHERE pl.status = 'DONE'
      AND pl.endTime IS NOT NULL
      AND pl.resultDate = CURRENT_DATE
      AND pl.endTime <= CURRENT_TIMESTAMP
    GROUP BY HOUR(pl.endTime)
    ORDER BY HOUR(pl.endTime)
""")
    List<Object[]> findTodayHourlyCompletedOutput();


    //dashboard-wip-balance
    @Query("""
        SELECT pl.processStep, SUM(pl.resultQty)
        FROM ProductionLog pl
        WHERE pl.resultDate = (
            SELECT MAX(pl2.resultDate) FROM ProductionLog pl2
        )
        GROUP BY pl.processStep
    """)
    List<Object[]> findWipBalanceByProcess();
}
