package com.hm.mes_final_260106.entity;

import jakarta.persistence.*;
import lombok.*;

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
    private String status;
}

