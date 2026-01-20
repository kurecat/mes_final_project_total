// 백엔드에서 제외
public class WorkOrderDto
{
    public long Id { get; set; }

    public string? ProductCode { get; set; }

    public int TargetQty { get; set; }

    public int CurrentQty { get; set; }

    public string? Status { get; set; }
}