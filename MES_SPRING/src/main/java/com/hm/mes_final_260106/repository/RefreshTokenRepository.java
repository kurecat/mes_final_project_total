package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    // memberId로 RefreshToken 조회
    Optional<RefreshToken> findByMemberId(Long memberId);

    // memberId로 RefreshToken 삭제 (로그아웃 시 사용)
    void deleteByMemberId(Long memberId);

    // memberId 존재 여부 확인
    boolean existsByMemberId(Long memberId);
}
