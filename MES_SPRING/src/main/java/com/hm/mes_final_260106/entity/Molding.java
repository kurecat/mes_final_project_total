package com.hm.mes_final_260106.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "molding")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Molding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "production_log_id", nullable = false)
    private ProductionLog productionLog;

    @Column(name = "mold_temp", length = 50)
    private String moldTemp;

    @Column(name = "injection_pressure", length = 50)
    private String injectionPressure;

    @Column(name = "cure_time", length = 50)
    private String cureTime;

    @Column(name = "clamp_force", length = 50)
    private String clampForce;
}

