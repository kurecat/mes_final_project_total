package com.hm.mes_final_260106.entity;
// 생산이력 관리 : 제품 1개가 실제로 생산된 '사실'을 기록하는 테이블
// 계획이 아니라 실행 결과, 수정 대상이 아니고 쌓인 결과 - 절대 수정 금지.
// 작업지시, 설비, 작업자, 투입된 자재(LOT)
// 5M1E의 집약체 ( Man, Machine, Material, Method, Measurement, Environment )

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hm.mes_final_260106.constant.ProductionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- 기본 연관관계 ---
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id", nullable = false)
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id")
    private Worker worker;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    // --- 생산 결과 필드 ---
    private String processStep;
    private String lotNo;
    private Integer resultQty;
    private Integer defectQty;

    @Enumerated(EnumType.STRING)
    private ProductionStatus status;

    private LocalDate resultDate;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String level;
    private String category;
    private String message;
    private LocalDateTime logTime;

    @PrePersist
    public void prePersist() {
        this.logTime = LocalDateTime.now();
    }

    // --- 연관관계 (각각 따로) ---

    // Item 리스트
    @OneToMany(mappedBy = "productionLog", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Item> items;

    // FinalInspection 리스트
    @OneToMany(mappedBy = "productionLog", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FinalInspection> finalInspections;

    // LOT 매핑 리스트
    @OneToMany(mappedBy = "productionLog", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LotMapping> lotMappings;

    // --- 공정별 엔티티 ---
    @OneToOne(mappedBy = "productionLog", cascade = CascadeType.ALL, orphanRemoval = true)
    private Dicing dicing;

    @OneToOne(mappedBy = "productionLog", cascade = CascadeType.ALL, orphanRemoval = true)
    private DieBonding dieBonding;

    @OneToOne(mappedBy = "productionLog", cascade = CascadeType.ALL, orphanRemoval = true)
    private WireBonding wireBonding;

    @OneToOne(mappedBy = "productionLog", cascade = CascadeType.ALL, orphanRemoval = true)
    private Molding molding;

    // --- 공정별 검사 엔티티 ---
    @OneToOne(mappedBy = "productionLog", cascade = CascadeType.ALL, orphanRemoval = true)
    private DicingInspection dicingInspection;

    @OneToOne(mappedBy = "productionLog", cascade = CascadeType.ALL, orphanRemoval = true)
    private DieBondingInspection dieBondingInspection;

    @OneToOne(mappedBy = "productionLog", cascade = CascadeType.ALL, orphanRemoval = true)
    private WireBondingInspection wireBondingInspection;

    @OneToOne(mappedBy = "productionLog", cascade = CascadeType.ALL, orphanRemoval = true)
    private MoldingInspection moldingInspection;
}