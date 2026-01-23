package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {
    // 시리얼 번호로 조회
    Optional<Item> findBySerialNumber(String serialNumber);
}
