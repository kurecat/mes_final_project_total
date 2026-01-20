public class WireBondingInspectionDto
{
    public int SampleSize { get; set; }                // 샘플링 수량
    public string? InspectionCriteria { get; set; }    // 검사 기준
    public double PullTestPassRatio { get; set; }      // 풀 테스트 합격률
    public double ShearTestPassRatio { get; set; }     // 전단 테스트 합격률
    public double XrayPassRatio { get; set; }          // X-ray 검사 합격률
    public double OverallPassRatio { get; set; }       // 전체 합격률

    // ✅ 역직렬화: byte[] → 검사 DTO
    public static WireBondingInspectionDto FromBytes(byte[] payload)
    {
        int offset = 0;
        WireBondingInspectionDto dto = new WireBondingInspectionDto();

        dto.SampleSize = BitConverter.ToInt32(payload, offset); offset += 4;

        int strLen = BitConverter.ToInt16(payload, offset); offset += 2;
        if (strLen > 0)
        {
            dto.InspectionCriteria = System.Text.Encoding.UTF8.GetString(payload, offset, strLen);
            offset += strLen;
        }

        dto.PullTestPassRatio = BitConverter.ToDouble(payload, offset); offset += 8;
        dto.ShearTestPassRatio = BitConverter.ToDouble(payload, offset); offset += 8;
        dto.XrayPassRatio = BitConverter.ToDouble(payload, offset); offset += 8;
        dto.OverallPassRatio = BitConverter.ToDouble(payload, offset); offset += 8;

        return dto;
    }
}