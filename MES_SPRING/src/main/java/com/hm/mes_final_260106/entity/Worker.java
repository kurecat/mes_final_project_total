package com.hm.mes_final_260106.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "worker",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_worker_member_id", columnNames = "member_id")
        })
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Worker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ⭐ Member는 그대로 두고, Worker에서만 1:1로 연결
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(length = 50)
    private String dept;      // 예: Photo / Etch / Fab-Common / EDS

    @Column(length = 20)
    private String shift;     // 예: Day / Swing / Night

    @Column(length = 20)
    private String status;    // 예: OFF / WORKING / BREAK

    private LocalDate joinDate;

    @Column(length = 300)
    private String certifications; // "Basic Safety,Lam Etcher"
}
