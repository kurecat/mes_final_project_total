public class FinalInspectionLogDto
{
    public int Id { get; set; }
    public int WorkOrderId { get; set; }
    public int ItemId { get; set; }
    public int MemberId { get; set; }
    public int EquipmentId { get; set; }
    public string? Electrical { get; set; }
    public string? Reliability { get; set; }
    public string? Visual { get; set; }
    public string? FinalPass { get; set; }

    // ✅ 역직렬화: byte[] → DTO
    public static FinalInspectionLogDto FromBytes(byte[] payload)
    {
        FinalInspectionLogDto dto = new FinalInspectionLogDto();
        int offset = 0;

        dto.Id = BitConverter.ToInt32(payload, offset); offset += 4;
        dto.WorkOrderId = BitConverter.ToInt32(payload, offset); offset += 4;
        dto.ItemId = BitConverter.ToInt32(payload, offset); offset += 4;
        dto.MemberId = BitConverter.ToInt32(payload, offset); offset += 4;
        dto.EquipmentId = BitConverter.ToInt32(payload, offset); offset += 4;

        // 문자열 처리: 길이(int) → UTF8 디코딩
        int strLen = BitConverter.ToInt16(payload, offset); offset += 2;
        if (strLen > 0)
        {
            dto.Electrical = System.Text.Encoding.UTF8.GetString(payload, offset, strLen);
            offset += strLen;
        }

        strLen = BitConverter.ToInt16(payload, offset); offset += 2;
        if (strLen > 0)
        {
            dto.Reliability = System.Text.Encoding.UTF8.GetString(payload, offset, strLen);
            offset += strLen;
        }

        strLen = BitConverter.ToInt16(payload, offset); offset += 2;
        if (strLen > 0)
        {
            dto.Visual = System.Text.Encoding.UTF8.GetString(payload, offset, strLen);
            offset += strLen;
        }

        strLen = BitConverter.ToInt16(payload, offset); offset += 2;
        if (strLen > 0)
        {
            dto.FinalPass = System.Text.Encoding.UTF8.GetString(payload, offset, strLen);
            offset += strLen;
        }

        return dto;
    }
}