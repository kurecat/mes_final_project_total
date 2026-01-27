package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.constant.MaterialTxType;
import com.hm.mes_final_260106.entity.MaterialTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MaterialTransactionRepository extends JpaRepository<MaterialTransaction, Long> {

    Optional<MaterialTransaction> findTop1ByMaterial_CodeOrderByCreatedAtDesc(String materialCode);
    // MaterialTransactionRepository
    Optional<MaterialTransaction>
    findTop1ByMaterial_CodeAndTypeOrderByCreatedAtDesc(
            String materialCode,
            MaterialTxType type
    );

    // 특정 자재의 전체 트랜잭션 로그
    List<MaterialTransaction> findByMaterial_CodeOrderByCreatedAtDesc(String materialCode);

    // (있으면 좋음) 오늘 로그 조회용
    List<MaterialTransaction> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);

    List<MaterialTransaction> findTop5ByOrderByCreatedAtDesc();
}
