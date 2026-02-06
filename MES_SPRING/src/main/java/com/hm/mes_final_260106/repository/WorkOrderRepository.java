package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.entity.WorkOrder;
import org.hibernate.jdbc.Work;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {

    // ▼ [수정] 기존 메서드에 @Query를 추가하여 Product를 함께 가져오도록 변경 (JOIN FETCH)
    @Query("SELECT DISTINCT w FROM WorkOrder w JOIN FETCH w.product ORDER BY w.id DESC")
    List<WorkOrder> findAllByOrderByIdDesc();

    Optional<WorkOrder> findFirstByStatusOrderByIdAsc(String status);

    Optional<WorkOrder> findFirstByStatusAndAssignedMachineIdIsNullOrderByIdAsc(String status);

    Optional<WorkOrder> findByStatusAndAssignedMachineId(String status, String assignedMachineId);

    // ⭐ 오늘 기준 + 라인 기준 작업지시 조회(dashboard-timechart)
    List<WorkOrder> findByTargetLineAndStartDateBetween(
            String targetLine,
            LocalDateTime startOfDay,
            LocalDateTime endOfDay
    );
    List<WorkOrder> findByStartDateBetween(LocalDateTime start, LocalDateTime end);

    // ▼ [선택 수정] 만약 이 메서드 결과로도 화면에 품목명(Product)을 띄운다면 여기도 FETCH를 추가해야 합니다.
    @Query("""
        SELECT wo
        FROM WorkOrder wo
        JOIN FETCH wo.product
        WHERE (:line = 'ALL' OR wo.targetLine = :line)
        ORDER BY wo.id DESC
    """)
    List<WorkOrder> findByLineForPerformance(@Param("line") String line);

    Optional<WorkOrder> findByWorkOrderNumber(String workOrderNumber);


}