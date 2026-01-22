package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.entity.Lot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface LotRepository extends JpaRepository<Lot, Long> {

    Optional<Lot> findByCode(String code);
}
