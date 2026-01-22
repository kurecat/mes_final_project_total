// 백엔드에서 내용 추가해서 넣기

// 생산 결과를 보고하는 DTO (백엔드 서버와 JSON으로 주고 받음)
// DTO에 SerialNo 추가

public class ProductionReportDto
{
    public long WorkOrderId { get; set; }
    public long LotId { get; set; }
    public long MemberId { get; set; }
    public long EquipmentId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string? DefectCode { get; set; }

    public DicingDto? DicingDto { get; set; }
    public DicingInspectionDto? DicingInspectionDto { get; set; }
    public DieBondingDto? DieBondingDto { get; set; }
    public DieBondingInspectionDto? DieBondingInspectionDto { get; set; }
    public WireBondingDto? WireBondingDto { get; set; }
    public WireBondingInspectionDto? WireBondingInspectionDto { get; set; }
    public MoldingDto? MoldingDto { get; set; }
    public MoldingInspectionDto? MoldingInspectionDto { get; set; }
    public ItemDto[]? ItemDtos { get; set; }
    public FinalInspectionDto[]? FinalInspectionDtos { get; set; }
    public string[]? InputLots { get; set; }


}

