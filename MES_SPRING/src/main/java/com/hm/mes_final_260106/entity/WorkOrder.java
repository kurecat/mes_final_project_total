package com.hm.mes_final_260106.entity;

// 작업 지시 테이블
// "무엇을, 몇 개를, 언제부터 생산할 것인가"를 정의하는 실행 단위
// ERP의 생산 계획을 현장에서 실행 가능한 명령으로 바꾼 결과물

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String workorder_number;   // 작업지시번호

    private String productId;          // 생산할 제품

    private int targetQty;             // 목표 수량
    private int currentQty;            // 현재 생산량

    private String status;             // WAITING, RELEASED, IN_PROGRESS, COMPLETED

    private String assignedMachineId;  // 설비 할당 정보 (MES 핵심)

    @Column(name = "target_line")
    private String targetLine;         // ⭐ 목표 라인 (Fab-Line-A 등)

    private LocalDateTime start_date;  // 작업지시 생성 시점
    private LocalDateTime end_date;    // 생산마감 시점

    @PrePersist
    public void prePersist() {
        start_date = LocalDateTime.now();
    }

    // ⭐ camelCase getter 별칭 (서비스/DTO에서 편하게 쓰기용)
    public String getWorkorderNumber() {
        return this.workorder_number;
    }

    // ⭐ camelCase setter 별칭 (혹시 앞으로 setWorkorderNumber 쓸 수도 있어서 같이 추가)
    public void setWorkorderNumber(String workorderNumber) {
        this.workorder_number = workorderNumber;
    }

}
