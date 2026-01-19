package com.hm.mes_final_260106.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "refresh_token",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_refresh_token_member_id", columnNames = "member_id")
        })
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {

    @Id
    private Long id; // 이미지에서 PK가 1001처럼 직접 값 사용 가능

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false, unique = true)
    private Member member;

    @Column(nullable = false, length = 500)
    private String token;
}
