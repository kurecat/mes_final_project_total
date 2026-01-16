public class DicingInspectionDto
{
    public int Id { get; set; }                   // PK
    public int DicId { get; set; }                // FK: Dicing 공정 참조 (숫자만)
    public int SampleSize { get; set; }           // 샘플링 수량 (EA)
    public string? InspectionCriteria { get; set; } // 검사 기준
    public double ThicknessPassRatio { get; set; }  // 두께 합격률 (%)
    public double ChippingPassRatio { get; set; }   // 칩핑 합격률 (%)
    public double OverallPassRatio { get; set; }    // 전체 합격률 (%)

    // 역직렬화: 검사 데이터만 담당
    public static DicingInspectionDto FromBytes(byte[] payload)
    {
        int offset = 0;
        DicingInspectionDto dto = new DicingInspectionDto();

        dto.Id = BitConverter.ToInt32(payload, offset); offset += 4;
        dto.DicId = BitConverter.ToInt32(payload, offset); offset += 4;
        dto.SampleSize = BitConverter.ToInt32(payload, offset); offset += 4;

        int strLen = BitConverter.ToInt32(payload, offset); offset += 4;
        if (strLen > 0)
        {
            dto.InspectionCriteria = System.Text.Encoding.UTF8.GetString(payload, offset, strLen);
            offset += strLen;
        }

        dto.ThicknessPassRatio = BitConverter.ToDouble(payload, offset); offset += 8;
        dto.ChippingPassRatio = BitConverter.ToDouble(payload, offset); offset += 8;
        dto.OverallPassRatio = BitConverter.ToDouble(payload, offset); offset += 8;

        return dto;
    }
}