package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.entity.Bom;
import com.hm.mes_final_260106.entity.BomItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BomItemRepository extends JpaRepository<BomItem, Long> {
    List<BomItem> findAllByBomId(Long bomId);
}
