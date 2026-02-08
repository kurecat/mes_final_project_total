package com.hm.mes_final_260106.constant;

public enum Authority {
    ROLE_OPERATOR, // 현장 작업자 ( 생산 보고 )
    ROLE_ADMIN, // 관리자 ( 작접 지시, 자재 관리 )
    ROLE_PRODUCTION
}
// 생산관리자 = 대시보드, 생산관리, 품질관리, 설비/자재관리 만 보게 하고 / 나머지 애들은 최고 관리자만 보게.