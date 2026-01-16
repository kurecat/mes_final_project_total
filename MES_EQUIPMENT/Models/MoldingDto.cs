public class MoldingDto
{
    public int Id { get; set; }                       // PK
    public double MoldTemp { get; set; }              // 금형 온도
    public double InjectionPressure { get; set; }     // 사출 압력
    public double CureTime { get; set; }              // 경화 시간
    public double ClampForce { get; set; }            // 클램프 힘

    // ✅ 역직렬화: byte[] → 공정 DTO
    public static MoldingDto FromBytes(byte[] payload)
    {
        int offset = 0;
        MoldingDto dto = new MoldingDto();

        dto.Id = BitConverter.ToInt32(payload, offset); offset += 4;
        dto.MoldTemp = BitConverter.ToDouble(payload, offset); offset += 8;
        dto.InjectionPressure = BitConverter.ToDouble(payload, offset); offset += 8;
        dto.CureTime = BitConverter.ToDouble(payload, offset); offset += 8;
        dto.ClampForce = BitConverter.ToDouble(payload, offset); offset += 8;

        return dto;
    }
}