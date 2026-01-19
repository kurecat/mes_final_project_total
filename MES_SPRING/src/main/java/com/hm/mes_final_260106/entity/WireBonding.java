package com.hm.mes_final_260106.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "wire_bonding")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WireBonding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_log_id", nullable = false)
    private ProcessLog processLog;

    @Column(name = "bonding_temp", length = 50)
    private String bondingTemp;

    @Column(name = "bonding_force", length = 50)
    private String bondingForce;

    @Column(name = "ultrasonic_power", length = 50)
    private String ultrasonicPower;

    @Column(name = "bonding_time", length = 50)
    private String bondingTime;

    @Column(name = "loop_height", length = 50)
    private String loopHeight;

    @Column(name = "ball_diameter", length = 50)
    private String ballDiameter;
}

