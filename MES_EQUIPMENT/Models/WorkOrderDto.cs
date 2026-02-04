public class WorkOrderDto
{
    public long Id { get; set; }

    public string? WorkOrderNumber { get; set; }   // 작업 지시 번호
    public string? ProductId { get; set; }

    public int TargetQty { get; set; }
    public int CurrentQty { get; set; }

    public string? Status { get; set; }

    public string? TargetLine { get; set; }        // 목표 라인
    public string? AssignedMachineId { get; set; } // 할당된 장비 ID

    public DateTime? StartDate { get; set; }       // 시작일자
    public DateTime? EndDate { get; set; }         // 종료일자
}