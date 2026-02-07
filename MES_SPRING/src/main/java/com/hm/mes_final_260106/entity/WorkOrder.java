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

    private String workOrderNumber;   // 작업지시번호

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bom_id", nullable = false)
    private Bom bom;                   // 생산할 bom

    private int targetQty;             // 목표 수량
    private int currentQty;            // 현재 생산량

    private String status;             // WAITING, RELEASED, IN_PROGRESS, COMPLETED

    private String assignedMachineId;  // 설비 할당 정보 (MES 핵심)

    @Column(name = "target_line")
    private String targetLine;         // ⭐ 목표 라인 (Fab-Line-A 등)

    private LocalDateTime startDate;  // 작업지시 생성 시점
    private LocalDateTime endDate;    // 생산마감 시점

    @Column(name = "shortage_material_name", nullable = true) // null 허용
    private String shortageMaterialName;

    @Column(name = "shortage_qty", nullable = true) // null 허용
    private Integer shortageQty;


    @PrePersist
    public void prePersist() {
        startDate = LocalDateTime.now();
    }

}
