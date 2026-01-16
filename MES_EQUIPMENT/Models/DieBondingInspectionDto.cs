public class DieBondingInspectionDto
{
    public int Id { get; set; }                        // PK
    public int DieBondingId { get; set; }              // FK: DieBonding 공정 참조
    public int SampleSize { get; set; }                // 샘플링 수량
    public string? InspectionCriteria { get; set; }    // 검사 기준
    public double AlignmentPassRatio { get; set; }     // 정렬 합격률
    public double VoidPassRatio { get; set; }          // 보이드 합격률
    public double OverallPassRatio { get; set; }       // 전체 합격률

    // ✅ 역직렬화: byte[] → 검사 DTO
    public static DieBondingInspectionDto FromBytes(byte[] payload)
    {
        int offset = 0;
        DieBondingInspectionDto dto = new DieBondingInspectionDto();

        dto.Id = BitConverter.ToInt32(payload, offset); offset += 4;
        dto.DieBondingId = BitConverter.ToInt32(payload, offset); offset += 4;
        dto.SampleSize = BitConverter.ToInt32(payload, offset); offset += 4;

        int strLen = BitConverter.ToInt32(payload, offset); offset += 4;
        if (strLen > 0)
        {
            dto.InspectionCriteria = System.Text.Encoding.UTF8.GetString(payload, offset, strLen);
            offset += strLen;
        }

        dto.AlignmentPassRatio = BitConverter.ToDouble(payload, offset); offset += 8;
        dto.VoidPassRatio = BitConverter.ToDouble(payload, offset); offset += 8;
        dto.OverallPassRatio = BitConverter.ToDouble(payload, offset); offset += 8;

        return dto;
    }
}