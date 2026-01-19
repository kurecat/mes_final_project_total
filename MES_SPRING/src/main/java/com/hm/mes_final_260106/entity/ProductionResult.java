package com.hm.mes_final_260106.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "production_result",
        indexes = {
                @Index(name = "idx_pr_date_line", columnList = "result_date, line"),
                @Index(name = "idx_pr_date_hour", columnList = "result_date, result_hour"),
                @Index(name = "idx_pr_date_product", columnList = "result_date, product_id")
        })
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "result_date", nullable = false)
    private LocalDate resultDate;

    @Column(name = "result_hour", nullable = false)
    private Integer resultHour; // 0~23

    @Column(length = 100)
    private String line;

    // 제품별 목표/실적을 보고 싶으면 product_id를 유지하는게 좋음
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    // ⭐ 금일 목표 생산량(계획)
    @Column(name = "plan_qty", nullable = false)
    private Integer planQty;

    // 실적(양품)
    @Column(name = "good_qty", nullable = false)
    private Integer goodQty;

    // 불량
    @Column(name = "defect_qty", nullable = false)
    private Integer defectQty;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}

