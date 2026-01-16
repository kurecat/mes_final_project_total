package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.constant.WorkOrderStatus;
import com.hm.mes_final_260106.entity.WorkOrder;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {
    List<WorkOrder> findAllByOrderByIdDesc();
    Optional<WorkOrder> findFirstByStatusOrderByIdAsc(String status); // 가장 먼저 들어온 대기 중인 작업 찾기
    // 특정 설비에 할당된 진행 중인 작업 찾기
    Optional<WorkOrder> findByStatusAndAssignedMachineId(String status, String assignedMachine);

    // 추가한 코드
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<WorkOrder> findFirstByStatusOrderByIdAsc(WorkOrderStatus status);
}
