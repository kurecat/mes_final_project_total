package com.hm.mes_final_260106.entity;

import com.hm.mes_final_260106.constant.Authority;
import com.hm.mes_final_260106.constant.MemberStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "member",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_member_email", columnNames = "email")
        })
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    private Authority authority;

    @Enumerated(EnumType.STRING)
    private MemberStatus status; // 관리자 승인 로직을 위한 필드 추가 (PENDING, ACTIVE, INACTIVE)

    @Builder
    public Member(String email, String password, String name, Authority authority, MemberStatus status) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.authority = authority;
        this.status = status != null ? status : MemberStatus.PENDING; // 회원가입 시 기본값 PENDING
    }
}
