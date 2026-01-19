package com.hm.mes_final_260106.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "molding_inspection")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MoldingInspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mol_id", nullable = false)
    private Molding molding;

    @Column(name = "sample_size")
    private Integer sampleSize;

    @Column(name = "inspection_criteria", length = 300)
    private String inspectionCriteria;

    @Column(name = "thickness_pass_ratio")
    private Double thicknessPassRatio;

    @Column(name = "void_pass_ratio")
    private Double voidPassRatio;

    @Column(name = "crack_pass_ratio")
    private Double crackPassRatio;

    @Column(name = "overall_pass_ratio")
    private Double overallPassRatio;
}

