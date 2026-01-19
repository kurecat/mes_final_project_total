public class FinalInspectionDto
{
    public string? SerialNumber { get; set; }
    public string? Electrical { get; set; }
    public string? Reliability { get; set; }
    public string? Visual { get; set; }
    public string? FinalPass { get; set; }

    // ✅ 역직렬화: byte[] → DTO
    public static FinalInspectionDto FromBytes(byte[] payload)
    {
        FinalInspectionDto dto = new FinalInspectionDto();
        int offset = 0;

        // 문자열 처리: 길이(int) → UTF8 디코딩
        int strLen = BitConverter.ToInt16(payload, offset); offset += 2;
        if (strLen > 0)
        {
            dto.SerialNumber = System.Text.Encoding.UTF8.GetString(payload, offset, strLen);
            offset += strLen;
        }

        strLen = BitConverter.ToInt16(payload, offset); offset += 2;
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