package com.hm.mes_final_260106.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "common_code")
@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommonCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 그룹 코드 (예: POS = 직급, EQP_TYPE = 설비타입)
    @Column(nullable = false)
    private String groupCode;

    // 상세 코드 (예: POS_01, EQP_A)
    @Column(nullable = false, unique = true)
    private String code;

    // 보여줄 값 (예: 팀장, 가공설비)
    @Column(nullable = false)
    private String value;

    // 정렬 순서 (1, 2, 3...)
    private int sortOrder;

    // 사용 여부 (Y/N)
    @Column(length = 1)
    private String useYn;
}