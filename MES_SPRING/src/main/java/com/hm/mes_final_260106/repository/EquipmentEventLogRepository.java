package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.entity.EquipmentEventLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EquipmentEventLogRepository
        extends JpaRepository<EquipmentEventLog, Long> {

    List<EquipmentEventLog>
    findTop10ByEquipmentIdOrderByCreatedAtDesc(Long equipmentId);

    void deleteByEquipmentId(Long id);
}
