package com.hm.mes_final_260106.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "permissions")
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // 예: 사용자 조회, 공정 데이터 수정

    @Column(nullable = false, unique = true)
    private String code; // 예: USER_READ, PROCESS_UPDATE

    private String groupName; // 권한 그룹 (예: 시스템 관리, 생산 관리)
}