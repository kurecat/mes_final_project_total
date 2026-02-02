package com.hm.mes_final_260106.entity;

import com.hm.mes_final_260106.constant.EquipmentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "equipment",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_equipment_code", columnNames = "code")
        })
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 100)
    private String type;

    @Column(length = 100)
    private String location;

    @Column(length = 50)
    @Enumerated(EnumType.STRING)
    private EquipmentStatus status;

    @Column(name = "install_date")
    private LocalDate installDate;

    private String errorCode; // 장애 사유

    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void updateTime() {
        this.updatedAt = LocalDateTime.now();
    }

}

