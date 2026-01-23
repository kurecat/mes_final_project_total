using System.Text.Json.Serialization;

namespace MesMachineSim.Models
{
    public class ProductionReportDto
    {
        [JsonPropertyName("orderId")]
        public long OrderId { get; set; }

        [JsonPropertyName("machineId")]
        public string? MachineId { get; set; } // [수정] ? 추가

        [JsonPropertyName("result")]
        public string? Result { get; set; }    // [수정] ? 추가

        [JsonPropertyName("defectCode")]
        public string? DefectCode { get; set; } // [수정] ? 추가
    }
}