package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    // 권한 코드로 조회 (예: USER_READ)
    Optional<Permission> findByCode(String code);
}