using System;
using System.Collections.Generic;

public class ProductionLogDto
{
    // --- 기본 식별 코드 ---
    public string? WorkOrderNumber { get; set; }   // 작업 지시 번호
    public string? WorkerCode { get; set; }        // 작업자 코드
    public string? EquipmentCode { get; set; }     // 설비 코드

    // --- 생산 결과 필드 ---
    public string? ProcessStep { get; set; }       // 공정 단계
    public string? LotNo { get; set; }             // 로트 번호
    public int? ResultQty { get; set; }            // 생산 수량
    public int? DefectQty { get; set; }            // 불량 수량
    public string? Status { get; set; }            // 생산 상태
    public DateOnly? ResultDate { get; set; }      // 생산일자
    public DateTime? StartTime { get; set; }       // 작업 시작 시간
    public DateTime? EndTime { get; set; }         // 작업 종료 시간
    public string? Level { get; set; }             // 로그 레벨
    public string? Category { get; set; }          // 로그 카테고리
    public string? Message { get; set; }           // 로그 메시지

    // --- 상세 공정 데이터 ---
    public DicingDto? DicingDto { get; set; }
    public DicingInspectionDto? DicingInspectionDto { get; set; }

    public DieBondingDto? DieBondingDto { get; set; }
    public DieBondingInspectionDto? DieBondingInspectionDto { get; set; }

    public WireBondingDto? WireBondingDto { get; set; }
    public WireBondingInspectionDto? WireBondingInspectionDto { get; set; }

    public MoldingDto? MoldingDto { get; set; }
    public MoldingInspectionDto? MoldingInspectionDto { get; set; }

    // --- 기타 ---
    public List<ItemDto> ItemDtos { get; set; } = new List<ItemDto>();
    public List<FinalInspectionDto> FinalInspectionDtos { get; set; } = new List<FinalInspectionDto>();
    public List<string> InputLots { get; set; } = new List<string>();
}