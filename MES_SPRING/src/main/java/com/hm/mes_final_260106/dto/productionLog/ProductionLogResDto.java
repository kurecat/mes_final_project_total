package com.hm.mes_final_260106.dto.productionLog;

import com.hm.mes_final_260106.dto.*;
import com.hm.mes_final_260106.dto.Item.ItemResDto;
import com.hm.mes_final_260106.dto.lot.LotResDto;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductionLogResDto {

    // --- 기본 식별 코드 ---
    private Long id;                // 로그 PK
    private String workOrderNumber; // 작업 지시 번호
    private String workerCode;      // 작업자 코드
    private String equipmentCode;   // 설비 코드

    // --- 생산 결과 필드 ---
    private String processStep;     // 공정 단계
    private String lotNo;           // 로트 번호
    private Integer resultQty;      // 생산 수량
    private Integer defectQty;      // 불량 수량
    private String status;          // 생산 상태 (Enum → String)
    private LocalDate resultDate;   // 생산일자
    private LocalDateTime startTime;// 작업 시작 시간
    private LocalDateTime endTime;  // 작업 종료 시간
    private String level;           // 로그 레벨 (INFO, WARN 등)
    private String category;        // 로그 카테고리 (PRODUCTION 등)
    private String message;         // 로그 메시지
    private LocalDateTime logTime;  // 로그 기록 시간

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
    private List<ItemResDto> itemDtos;              // 생산된 아이템 리스트
    private List<FinalInspectionDto> finalInspectionDtos; // 최종 검사 리스트
    private List<LotResDto> inputLots;                 // 투입된 LOT 코드 리스트
}