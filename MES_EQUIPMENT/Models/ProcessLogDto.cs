public class ProcessLogDto
{
    public int ProcessLogId { get; set; }
    public int WorkOrderId { get; set; }
    public int LotId { get; set; }
    public int MemberId { get; set; }
    public int EquipmentId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }

    // ✅ 역직렬화: byte[] → DTO
    public static ProcessLogDto FromBytes(byte[] payload)
    {
        int offset = 0;
        ProcessLogDto dto = new ProcessLogDto();

        dto.ProcessLogId = BitConverter.ToInt32(payload, offset); offset += 4;
        dto.WorkOrderId = BitConverter.ToInt32(payload, offset); offset += 4;
        dto.LotId = BitConverter.ToInt32(payload, offset); offset += 4;
        dto.MemberId = BitConverter.ToInt32(payload, offset); offset += 4;
        dto.EquipmentId = BitConverter.ToInt32(payload, offset); offset += 4;

        long startBinary = BitConverter.ToInt64(payload, offset); offset += 8;
        long endBinary = BitConverter.ToInt64(payload, offset); offset += 8;

        dto.StartTime = DateTime.FromBinary(startBinary);
        dto.EndTime = DateTime.FromBinary(endBinary);

        return dto;
    }
}