package com.hm.mes_final_260106.repository;

import com.hm.mes_final_260106.entity.CommonCode;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommonCodeRepository extends JpaRepository<CommonCode, Long> {

    // 1. 그룹 코드로 조회 (예: 직급 리스트만 줘!) + 순서대로
    List<CommonCode> findByGroupCodeOrderBySortOrderAsc(String groupCode);

    // 2. 전체 조회 + 그룹별/순서별 정렬
    List<CommonCode> findAllByOrderByGroupCodeAscSortOrderAsc();
}