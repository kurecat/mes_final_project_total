package com.hm.mes_final_260106.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "worker")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Worker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ⭐ 작업자 실명 (로그인과 무관)
    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 50)
    private String dept;      // PHOTO / ETCH / CMP / TBD

    @Column(length = 20)
    private String shift;     // Day / Night

    @Column(length = 20)
    private String status;    // ON / OFF / LEAVE

    private LocalDate joinDate;

    @Column(length = 300)
    private String certifications; // Basic Safety, Lam Etcher
}
