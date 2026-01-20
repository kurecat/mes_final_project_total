public class ItemDto
{
    public string? SerialNumber { get; set; }
    public string? InspectionResult { get; set; }

    public static ItemDto FromBytes(byte[] payload)
    {
        ItemDto dto = new ItemDto();
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
            dto.InspectionResult = System.Text.Encoding.UTF8.GetString(payload, offset, strLen);
            offset += strLen;
        }

        return dto;
    }
}