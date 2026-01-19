public class DieBondingDto
{
    public double PickUpForce { get; set; }       // 픽업 힘
    public double PlacementAccuracy { get; set; } // 배치 정확도
    public double EpoxyDispenseVolume { get; set; } // 에폭시 도포량
    public double CuringTemp { get; set; }        // 경화 온도

    // ✅ 역직렬화: byte[] → 공정 DTO
    public static DieBondingDto FromBytes(byte[] payload)
    {
        int offset = 0;
        DieBondingDto dto = new DieBondingDto();

        dto.PickUpForce = BitConverter.ToDouble(payload, offset); offset += 8;
        dto.PlacementAccuracy = BitConverter.ToDouble(payload, offset); offset += 8;
        dto.EpoxyDispenseVolume = BitConverter.ToDouble(payload, offset); offset += 8;
        dto.CuringTemp = BitConverter.ToDouble(payload, offset); offset += 8;

        return dto;
    }
}