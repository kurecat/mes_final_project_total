package com.hm.mes_final_260106.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dicing")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dicing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_log_id", nullable = false)
    private ProcessLog processLog;

    @Column(name = "spindle_speed", length = 50)
    private String spindleSpeed;

    @Column(name = "feed_rate", length = 50)
    private String feedRate;

    @Column(name = "blade_wear", length = 50)
    private String bladeWear;

    @Column(name = "coolant_flow", length = 50)
    private String coolantFlow;
}
