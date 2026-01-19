package com.hm.mes_final_260106.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "production_result")
@Getter
@Setter
@NoArgsConstructor
public class ProductionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "result_date", nullable = false)
    private LocalDate resultDate;

    @Column(name = "result_hour", nullable = false)
    private Integer resultHour; // 0~23

    @Column(name = "line", nullable = false)
    private String line;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "plan_qty", nullable = false)
    private Integer planQty;

    @Column(name = "good_qty", nullable = false)
    private Integer goodQty;

    @Column(name = "defect_qty", nullable = false)
    private Integer defectQty;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}

