package com.hm.mes_final_260106.entity;

import com.hm.mes_final_260106.constant.EquipmentEventType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EquipmentEventLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @Enumerated(EnumType.STRING)
    private EquipmentEventType eventType;
    // TYPE_CHANGE / STATUS_CHANGE

    private String beforeValue;
    private String afterValue;

    private String message;

    private LocalDateTime createdAt;
}
