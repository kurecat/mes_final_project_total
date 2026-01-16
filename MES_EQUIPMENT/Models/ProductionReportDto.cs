

// 생산 결과를 보고하는 DTO (백엔드 서버와 JSON으로 주고 받음)
// DTO에 SerialNo 추가

public class ProductionReportDto
{
    public long OrderId { get; set; }
    public ProcessLogDto? ProcessLogDto { get; set; }
    public DicingDto? DicingDto { get; set; }
    public DieBondingDto? DieBondingDto { get; set; }
    public WireBondingDto? WireBondingDto { get; set; }
    public MoldingDto? MoldingDto { get; set; }

    public FinalInspectionLogDto[]? FinalInspectionLogDtos { get; set; }

    public string? DefectCode { get; set; }
}

