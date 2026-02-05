public class EquipmentMetricUpdateReqDto
{
    public string? EquipmentCode { get; set; }   // 장비 ID
    public double Uph { get; set; }             // 시간당 웨이퍼 처리수
    public double Temperature { get; set; }     // 온도
    public int Progress { get; set; }           // 진행도 (0~100)

    public static EquipmentMetricUpdateReqDto FromBytes(byte[] payload)
    {
        EquipmentMetricUpdateReqDto dto = new EquipmentMetricUpdateReqDto();

        int offset = 0;
        int strLen = BitConverter.ToInt16(payload, offset); offset += 2;
        if (strLen > 0)
        {
            dto.EquipmentCode = System.Text.Encoding.UTF8.GetString(payload, offset, strLen);
            offset += strLen;
        }
        dto.Uph = BitConverter.ToDouble(payload, offset); offset += 8;
        dto.Temperature = BitConverter.ToDouble(payload, offset); offset += 8;
        dto.Progress = BitConverter.ToInt32(payload, offset); offset += 4;
        dto.EquipmentCode = AppConfig.EquipmentCode;

        return dto;
    }
}