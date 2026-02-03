package com.hm.mes_final_260106.dto.lot;

import com.hm.mes_final_260106.entity.Lot;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LotResDto {

    private Long id;             // DB PK (상세 조회용)
    private String lotCode;      // 화면에 보여줄 Lot 번호 (예: LOT-2024...)
    private String materialName; // 자재/제품 이름
    private String status;       // 상태 (IN_USE, EXHAUSTED 등)
    private Integer currentQty;  // 현재 수량
    private String location;     // 위치

    // Entity -> DTO 변환 메서드
    public static LotResDto from(Lot lot) {
        return LotResDto.builder()
                .id(lot.getId())
                .lotCode(lot.getCode())
                // 자재가 null일 경우를 대비한 안전한 처리
                .materialName(lot.getMaterial() != null ? lot.getMaterial().getName() : "Unknown")
                .status(lot.getStatus())
                // Lot 엔티티에 수량이 없으면 Material의 재고를 가져오거나 0 처리
                .currentQty(lot.getMaterial() != null ? lot.getMaterial().getCurrentStock() : 0)
                .location(lot.getLocation())
                .build();
    }
}