package com.hm.mes_final_260106.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "inspection_standard")
@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InspectionStandard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String processName; // 공정명 (예: DieBonding)
    private String checkItem;   // 검사 항목 (예: Temperature)

    private Double lsl;         // 하한값 (Lower Spec Limit)
    private Double usl;         // 상한값 (Upper Spec Limit)
    private String unit;        // 단위 (예: °C)

    private String description; // 설명
}