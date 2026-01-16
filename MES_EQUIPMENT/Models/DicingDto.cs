public class DicingDto
{
    public int Id { get; set; }               // PK
    public int ProcessLogId { get; set; }     // FK: ProcessLog 참조 (숫자만)
    public int SpindleSpeed { get; set; }     // 스핀들 회전 속도 (rpm)
    public double FeedRate { get; set; }      // 이송 속도 (mm/s)
    public double BladeWear { get; set; }     // 블레이드 마모율 (%)
    public double CoolantFlow { get; set; }   // 냉각수 유량 (L/min)

    // 역직렬화: 공정 데이터만 담당
    public static DicingDto FromBytes(byte[] payload)
    {
        int offset = 0;
        DicingDto dto = new DicingDto();

        dto.Id = BitConverter.ToInt32(payload, offset); offset += 4;
        dto.ProcessLogId = BitConverter.ToInt32(payload, offset); offset += 4;
        dto.SpindleSpeed = BitConverter.ToInt32(payload, offset); offset += 4;
        dto.FeedRate = BitConverter.ToDouble(payload, offset); offset += 8;
        dto.BladeWear = BitConverter.ToDouble(payload, offset); offset += 8;
        dto.CoolantFlow = BitConverter.ToDouble(payload, offset); offset += 8;

        return dto;
    }
}