package com.hm.mes_final_260106.entity;
// 생산이력 관리 : 제품 1개가 실제로 생산된 '사실'을 기록하는 테이블
// 계획이 아니라 실행 결과, 수정 대상이 아니고 쌓인 결과 - 절대 수정 금지.
// 작업지시, 설비, 작업자, 투입된 자재(LOT)
// 5M1E의 집약체 ( Man, Machine, Material, Method, Measurement, Environment )

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Setter @Getter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductionLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id", nullable = false)
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lot_id")
    private Lot lot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;
}
