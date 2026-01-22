package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.dto.HourlyPerformanceResDto;
import com.hm.mes_final_260106.dto.PerformanceSummaryResDto;
import com.hm.mes_final_260106.entity.ProductionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

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

    // 시간대별 실적 조회 (Native Query 사용)
    @Query(value = "SELECT " +
            "  CONCAT(LPAD(pr.result_hour, 2, '0'), ':00') as time, " +
            "  CAST(COALESCE(SUM(pr.plan_qty), 0) AS UNSIGNED) as plan, " +
            "  CAST(COALESCE(SUM(pr.good_qty), 0) AS UNSIGNED) as actual, " +
            "  CAST(COALESCE(SUM(pr.defect_qty), 0) AS UNSIGNED) as scrap " +
            "FROM production_result pr " +
            "WHERE pr.result_date = :date " +
            "  AND (:line = 'ALL' OR pr.line = :line) " +
            "GROUP BY pr.result_hour " +
            "ORDER BY pr.result_hour", nativeQuery = true)
    List<Object[]> getHourlyNative(@Param("date") LocalDate date, @Param("line") String line);

    // 🚨 [추가] 실시간 실적 집계 업데이트를 위한 조회 메서드
    // (날짜, 시간, 라인, 제품) 조건으로 기존 실적 데이터 찾기
    Optional<ProductionResult> findByResultDateAndResultHourAndLineAndProduct(
            LocalDate resultDate,
            Integer resultHour,
            String line,
            com.hm.mes_final_260106.entity.Product product
    );
}





