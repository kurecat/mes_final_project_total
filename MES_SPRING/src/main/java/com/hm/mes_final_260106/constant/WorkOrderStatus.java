package com.hm.mes_final_260106.constant;

public enum WorkOrderStatus {
    WAIT,       // 대기
    ISSUED,     // 설비에 할당됨 (poll로 내려감)
    RUNNING,    // 설비 작업 시작
    DONE,       // 완료
    CANCELLED   // 취소
}
