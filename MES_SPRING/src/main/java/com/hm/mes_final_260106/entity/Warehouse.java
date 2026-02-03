package com.hm.mes_final_260106.entity;

import com.hm.mes_final_260106.constant.WarehouseStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "warehouse")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Warehouse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long Id;   // PK

    @Column(nullable = false, length = 100)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;   // 창고 이름

    @Column(length = 50)
    private String type;   // 창고 유형 (예: Main, Sub, ColdStorage 등)

    @Column(length = 200)
    private String address;         // 주소 또는 LocationCode

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private WarehouseStatus status;          // 상태 (예: Active, Inactive)

    @Column
    private Integer capacity;   // 최대 저장 가능 갯수

    @Column
    private Integer occupancy;  // 현재 저장된 갯수
}

