package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    Optional<Equipment> findByCode(String code);
    boolean existsByCode(String code);

    // 전체 설비 수
    @Query("SELECT COUNT(e) FROM Equipment e")
    int countAll();

    // 상태별 설비 수 (RUN / DOWN / IDLE)
    int countByStatus(String status);

}