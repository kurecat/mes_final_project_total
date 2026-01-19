package com.hm.mes_final_260106.entity;
// 자재( Material ) 테이블
// 자재의 기준 정보와 현재 재고 상태를 관리하는 테이블
// 자재의 과거 이력 관리가 아니라, 지금 사용 가능한 수량을 보여주는 것이 목적.
// MES는 자재의 이력( history )보다 실행 결과( state )를 중시
// 자재 사용 이력은 별도의 테이블이 아니라 생산이력( ProductionLog ) + BOM을 통해 간접적으로 추적
// currentStock( 현재 재고 수량 )은 사용자가 직접 수정하는 것이 아니고, 자재 입고 -> 증가, 생산 시 -> 감소

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "material",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_material_code", columnNames = "code")
        })
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 100)
    private String category;

    @Column(name = "current_stock")
    private Integer currentStock;
}
