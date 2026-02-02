package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    // 역할 이름으로 조회 (중복 검사 등)
    Optional<Role> findByName(String name);

    // 역할 코드로 조회 (예: ROLE_ADMIN)
    Optional<Role> findByCode(String code);

    // 이미 존재하는 역할인지 확인
    boolean existsByCode(String code);
}