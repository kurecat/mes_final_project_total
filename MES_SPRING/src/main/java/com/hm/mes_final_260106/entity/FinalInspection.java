package com.hm.mes_final_260106.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "final_inspection_log")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinalInspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "production_log_id", nullable = false)
    private ProductionLog productionLog;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(length = 50)
    private String electrical;

    @Column(length = 50)
    private String reliability;

    @Column(length = 50)
    private String visual;

    @Column(name = "final_pass", length = 20)
    private String finalPass;
}

