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

    @Query("""
        SELECT HOUR(pl.endTime) AS hour, COALESCE(SUM(pl.resultQty), 0)
        FROM ProductionLog pl
        WHERE pl.status = 'DONE'
          AND pl.resultDate = (
              SELECT MAX(pl2.resultDate)
              FROM ProductionLog pl2
          )
          AND HOUR(pl.endTime) BETWEEN :startHour AND :endHour
        GROUP BY HOUR(pl.endTime)
        ORDER BY HOUR(pl.endTime)
    """)


    List<Object[]> findHourlyActualOnLatestDate(
            @Param("startHour") int startHour,
            @Param("endHour") int endHour
    );
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
