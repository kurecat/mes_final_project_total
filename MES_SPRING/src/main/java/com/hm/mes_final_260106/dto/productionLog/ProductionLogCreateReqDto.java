package com.hm.mes_final_260106.dto.productionLog;
// 생산 실적 보고 : 현장에서 생산한 1건의 생산 결과를 시스템에 보고하기 위한 입력 DTO
// 설비 -> 서버

import com.hm.mes_final_260106.dto.*;
import com.hm.mes_final_260106.dto.Item.ItemResDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductionLogCreateReqDto {

    // --- 기본 식별 코드 ---
    private String workOrderNumber;   // 작업 지시 번호
    private String workerCode;        // 작업자 코드
    private String equipmentCode;     // 설비 코드

    // --- 생산 결과 필드 ---
    private String processStep;       // 공정 단계
    private String lotNo;             // 로트 번호
    private Integer resultQty;        // 생산 수량
    private Integer defectQty;        // 불량 수량
    private String status;            // 생산 상태 (Enum → String으로 전달)
    private LocalDate resultDate;     // 생산일자
    private LocalDateTime startTime;  // 작업 시작 시간 (필요 시 유지)
    private LocalDateTime endTime;    // 작업 종료 시간 (필요 시 유지)
    private String level;             // 로그 레벨 (INFO, WARN 등)
    private String category;          // 로그 카테고리 (PRODUCTION 등)
    private String message;           // 로그 메시지

    // --- 상세 공정 데이터 ---
    private DicingDto dicingDto;
    private DicingInspectionDto dicingInspectionDto;

    private DieBondingDto dieBondingDto;
    private DieBondingInspectionDto dieBondingInspectionDto;

    private WireBondingDto wireBondingDto;
    private WireBondingInspectionDto wireBondingInspectionDto;

    private MoldingDto moldingDto;
    private MoldingInspectionDto moldingInspectionDto;

    // --- 기타 ---
    private List<ItemResDto> itemDtos;
    private List<FinalInspectionDto> finalInspectionDtos;
    private List<String> inputLots;

}