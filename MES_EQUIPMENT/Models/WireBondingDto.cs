public class WireBondingDto
{
    public int Id { get; set; }                  // PK
    public int ProcessLogId { get; set; }     // FK: ProcessLog 참조 (숫자만)
    public double BondingTemp { get; set; }      // 본딩 온도
    public double BondingForce { get; set; }     // 본딩 힘
    public double UltrasonicPower { get; set; }  // 초음파 출력
    public double BondingTime { get; set; }      // 본딩 시간
    public double LoopHeight { get; set; }       // 루프 높이
    public double BallDiameter { get; set; }     // 볼 직경

    // ✅ 역직렬화: byte[] → 공정 DTO
    public static WireBondingDto FromBytes(byte[] payload)
    {
        int offset = 0;
        WireBondingDto dto = new WireBondingDto();

        dto.Id = BitConverter.ToInt32(payload, offset); offset += 4;
        dto.ProcessLogId = BitConverter.ToInt32(payload, offset); offset += 4;
        dto.BondingTemp = BitConverter.ToDouble(payload, offset); offset += 8;
        dto.BondingForce = BitConverter.ToDouble(payload, offset); offset += 8;
        dto.UltrasonicPower = BitConverter.ToDouble(payload, offset); offset += 8;
        dto.BondingTime = BitConverter.ToDouble(payload, offset); offset += 8;
        dto.LoopHeight = BitConverter.ToDouble(payload, offset); offset += 8;
        dto.BallDiameter = BitConverter.ToDouble(payload, offset); offset += 8;

        return dto;
    }
}