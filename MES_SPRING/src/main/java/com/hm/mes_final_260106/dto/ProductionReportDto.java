package com.hm.mes_final_260106.dto;
// 생산 실적 보고 : 현장에서 생산한 1건의 생산 결과를 시스템에 보고하기 위한 입력 DTO
// 설비 -> 서버

import com.hm.mes_final_260106.entity.LotMapping;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductionReportDto {

    // --- 기존 필드 유지 ---
    private Long workOrderId;           // 작업 지시 ID
    private Long lotId;                 // lot ID
    private Long memberId;              // 작업자 ID
    private Long equipmentId;           // 설비 ID
    private LocalDateTime startTime;    // 작업 시작 시간
    private LocalDateTime endTime;      // 작업 시작 시간
    private String defectCode;          // 불량 코드

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
    private List<String> inputLots;
    private List<ItemDto> itemDtos;
    private List<FinalInspectionDto> finalInspectionDtos;
}
