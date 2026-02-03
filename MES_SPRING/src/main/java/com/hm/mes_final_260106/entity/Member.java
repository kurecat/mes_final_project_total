package com.hm.mes_final_260106.entity;

import com.hm.mes_final_260106.constant.Authority;
import com.hm.mes_final_260106.constant.MemberStatus;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 100)
    private String name;

    // ★ 추가됨: 부서명
    @Column(length = 50)
    private String department;

    // ★ 추가됨: 전화번호
    @Column(length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    private Authority authority;

    @Enumerated(EnumType.STRING)
    private MemberStatus status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;

    @Builder
    public Member(String email, String password, String name, String department, String phone, Authority authority, MemberStatus status) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.department = department; // ★ 추가
        this.phone = phone;           // ★ 추가
        this.authority = authority;
        this.status = status != null ? status : MemberStatus.PENDING;
    }
}