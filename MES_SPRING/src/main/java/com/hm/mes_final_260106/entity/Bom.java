package com.hm.mes_final_260106.entity;
// BOM ( Bill of Materials )
// 제품 한개를 만들기 위해 필요한 자재 목록과 소요량을 정의 하는 테이블
// 생산의 레시피 역할을 함
// MES에서 생산과 자재를 연결하는 핵심 기준 정보
// MES에서 생산이 진행될 때 어떤 자재가 얼마만큼 사용되었는가를 자동으로 계산
// 생산 시 BOM 기준으로 자동 재고 차감( Backflushing )
// Material 와 ManyToOne : 하나의 BOM은 여러 자재를 가짐. 즉 하나의 자재는 여러 제품의 BOM에 사용 될 수 있음.
// Product 와 BOM은 1 : N, Material 과 BOM은 1 : N

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bom")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;

    @Column(name = "required_qty", nullable = false)
    private Integer requiredQty;
}