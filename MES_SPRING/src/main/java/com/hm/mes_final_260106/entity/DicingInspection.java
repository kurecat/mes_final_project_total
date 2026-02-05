package com.hm.mes_final_260106.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dicing_inspection")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DicingInspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "production_log_id", nullable = false)
    private ProductionLog productionLog;

    @Column(name = "sample_size")
    private Integer sampleSize;

    @Column(name = "inspection_criteria", length = 300)
    private String inspectionCriteria;

    @Column(name = "thickness_pass_ratio")
    private Double thicknessPassRatio;

    @Column(name = "chipping_pass_ratio")
    private Double chippingPassRatio;

    @Column(name = "overall_pass_ratio")
    private Double overallPassRatio;
}

