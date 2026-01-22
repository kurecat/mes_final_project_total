package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.entity.LoginLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LoginLogRepository extends JpaRepository<LoginLog, Long> {
    // 최신순 조회
    List<LoginLog> findAllByOrderByLoginTimeDesc();
}