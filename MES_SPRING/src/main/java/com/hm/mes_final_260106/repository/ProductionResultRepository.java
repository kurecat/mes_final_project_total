package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.dto.PerformanceSummaryResDto;
import com.hm.mes_final_260106.entity.ProductionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface ProductionResultRepository extends JpaRepository<ProductionResult, Long> {

    @Query(
            "SELECT new com.hm.mes_final_260106.dto.PerformanceSummaryResDto(" +
                    "COALESCE(SUM(pr.planQty), 0), " +
                    "COALESCE(SUM(pr.goodQty), 0), " +
                    "COALESCE(SUM(pr.defectQty), 0), " +
                    "CASE " +
                    " WHEN COALESCE(SUM(pr.planQty), 0) = 0 THEN 0 " +
                    " ELSE (COALESCE(SUM(pr.goodQty), 0) * 100.0 / COALESCE(SUM(pr.planQty), 0)) " +
                    "END" +
                    ") " +
                    "FROM ProductionResult pr " +
                    "WHERE pr.resultDate = :date " +
                    "AND (:line = 'ALL' OR pr.line = :line)"
    )
    PerformanceSummaryResDto getSummary(
            @Param("date") LocalDate date,
            @Param("line") String line
    );
}




