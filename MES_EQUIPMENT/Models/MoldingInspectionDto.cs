public class MoldingInspectionDto
{
    public int Id { get; set; }                          // PK
    public int MoldingId { get; set; }                   // FK: Molding 공정 참조
    public int SampleSize { get; set; }                  // 샘플링 수량
    public string? InspectionCriteria { get; set; }      // 검사 기준
    public double ThicknessPassRatio { get; set; }       // 두께 합격률
    public double VoidPassRatio { get; set; }            // 보이드 합격률
    public double CrackPassRatio { get; set; }           // 크랙 합격률
    public double OverallPassRatio { get; set; }         // 전체 합격률

    // ✅ 역직렬화: byte[] → 검사 DTO
    public static MoldingInspectionDto FromBytes(byte[] payload)
    {
        int offset = 0;
        MoldingInspectionDto dto = new MoldingInspectionDto();

        dto.Id = BitConverter.ToInt32(payload, offset); offset += 4;
        dto.MoldingId = BitConverter.ToInt32(payload, offset); offset += 4;
        dto.SampleSize = BitConverter.ToInt32(payload, offset); offset += 4;

        int strLen = BitConverter.ToInt32(payload, offset); offset += 4;
        if (strLen > 0)
        {
            dto.InspectionCriteria = System.Text.Encoding.UTF8.GetString(payload, offset, strLen);
            offset += strLen;
        }

        dto.ThicknessPassRatio = BitConverter.ToDouble(payload, offset); offset += 8;
        dto.VoidPassRatio = BitConverter.ToDouble(payload, offset); offset += 8;
        dto.CrackPassRatio = BitConverter.ToDouble(payload, offset); offset += 8;
        dto.OverallPassRatio = BitConverter.ToDouble(payload, offset); offset += 8;

        return dto;
    }
}