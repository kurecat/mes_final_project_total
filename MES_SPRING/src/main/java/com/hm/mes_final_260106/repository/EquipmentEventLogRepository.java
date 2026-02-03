package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.entity.EquipmentEventLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Arrays;
import java.util.List;

public interface EquipmentEventLogRepository
        extends JpaRepository<EquipmentEventLog, Long> {

    // 전체 로그 (최신순)
    List<EquipmentEventLog> findAllByOrderByCreatedAtDesc();

    List<EquipmentEventLog>
    findByEquipmentIdOrderByCreatedAtDesc(Long equipmentId);

    void deleteByEquipmentId(Long id);





}
