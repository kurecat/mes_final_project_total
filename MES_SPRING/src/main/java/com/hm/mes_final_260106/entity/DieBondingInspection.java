package com.hm.mes_final_260106.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "die_bonding_inspection")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DieBondingInspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "db_id", nullable = false)
    private DieBonding dieBonding;

    @Column(name = "sample_size")
    private Integer sampleSize;

    @Column(name = "inspection_criteria", length = 300)
    private String inspectionCriteria;

    @Column(name = "alignment_pass_ratio")
    private Double alignmentPassRatio;

    @Column(name = "void_pass_ratio")
    private Double voidPassRatio;

    @Column(name = "overall_pass_ratio")
    private Double overallPassRatio;
}

