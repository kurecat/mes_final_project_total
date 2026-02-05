package com.hm.mes_final_260106.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "wire_bonding_inspection")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WireBondingInspection {

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

    @Column(name = "pull_test_pass_ratio")
    private Double pullTestPassRatio;

    @Column(name = "shear_test_pass_ratio")
    private Double shearTestPassRatio;

    @Column(name = "xray_pass_ratio")
    private Double xrayPassRatio;

    @Column(name = "overall_pass_ratio")
    private Double overallPassRatio;
}

