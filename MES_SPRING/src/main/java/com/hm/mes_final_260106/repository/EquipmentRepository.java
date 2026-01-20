package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    Optional<Equipment> findByCode(String code);
    boolean existsByCode(String code);

}