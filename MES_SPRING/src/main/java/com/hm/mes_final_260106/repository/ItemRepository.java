package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemRepository extends JpaRepository<Item, Long> {
}
