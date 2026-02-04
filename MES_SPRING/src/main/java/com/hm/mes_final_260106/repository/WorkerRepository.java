package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.entity.Worker;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkerRepository extends JpaRepository<Worker, Long> {
    Optional<Worker> findByMemberId(Long memberId);
    Optional<Worker> findByCode(String code);
}
