package com.hm.mes_final_260106.dto.warehouse;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarehouseCreateReqDto {

    private String code;       // 창고 코드
    private String name;       // 창고 이름
    private String type;       // 창고 유형 (예: Main, Sub, ColdStorage 등)
    private String address;    // 주소 또는 LocationCode
    private Integer capacity;  // 최대 저장 가능 갯수
}
