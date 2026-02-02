package com.hm.mes_final_260106.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // 예: 생산 관리자, 시스템 관리자

    @Column(nullable = false, unique = true)
    private String code; // 예: ROLE_PRODUCTION_MGR, ROLE_ADMIN

    private String description; // 역할 설명

    // 시스템 기본 역할 여부 (삭제 불가 처리를 위해)
    @Column(columnDefinition = "BOOLEAN DEFAULT false")
    private boolean isSystem;

    // Role과 Permission은 다대다(N:M) 관계
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "role_permissions",
            joinColumns = @JoinColumn(name = "role_id"),
            inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    @Builder.Default
    private Set<Permission> permissions = new HashSet<>();
}