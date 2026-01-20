package com.hm.mes_final_260106.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "die_bonding")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DieBonding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "production_log_id", nullable = false)
    private ProductionLog productionLog;

    @Column(name = "pick_up_force", length = 50)
    private String pickUpForce;

    @Column(name = "placement_accuracy", length = 50)
    private String placementAccuracy;

    @Column(name = "epoxy_dispense_volume", length = 50)
    private String epoxyDispenseVolume;

    @Column(name = "curing_temp", length = 50)
    private String curingTemp;
}
