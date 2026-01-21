package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.entity.MaterialTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface MaterialTransactionRepository extends JpaRepository<MaterialTransaction, Long> {

    List<MaterialTransaction> findByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime start,
            LocalDateTime end
    );
}
