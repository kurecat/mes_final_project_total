package com.hm.mes_final_260106.dto;
// 생산 실적 보고 : 현장에서 생산한 1건의 생산 결과를 시스템에 보고하기 위한 입력 DTO
// 설비 -> 서버

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductionReportDto {

    // --- 기존 필드 유지 ---
    private Long orderId;      // 작업 지시 ID
    private String machineId;  // 설비 ID (기존 필드 유지 - 어떤 설비에서 왔는지 식별)
    private String result;     // OK or NG (기존 필드 유지 - 전체 결과)
    private String defectCode; // 불량 코드

    // --- 추가 요청 필드 ---
    private String serialNo;   // [NEW] 제품 일련번호 (Serial Number)

    // --- 상세 공정 데이터 (Nested DTOs) ---
    // 각 공정 단계별 데이터가 있을 경우에만 채워서 보냄 (Nullable)

    private DicingDto dicingDto;
    private DicingInspectionDto dicingInspectionDto;

    private DieBondingDto dieBondingDto;
    private DieBondingInspectionDto dieBondingInspectionDto;

    private WireBondingDto wireBondingDto;
    private WireBondingInspectionDto wireBondingInspectionDto;

    private MoldingDto moldingDto;
    private MoldingInspectionDto moldingInspectionDto;

    // 배열([]) 대신 List<> 사용 권장
    private List<FinalInspectionLogDto> finalInspectionLogDto;

    private ProcessLogDto processLogDto;
}
