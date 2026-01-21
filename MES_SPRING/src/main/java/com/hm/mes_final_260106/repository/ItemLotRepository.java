package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.entity.LotMapping;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemLotRepository extends JpaRepository<LotMapping, Long> {
}
