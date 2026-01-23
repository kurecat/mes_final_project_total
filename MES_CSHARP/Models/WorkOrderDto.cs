using System.Text.Json.Serialization;

namespace MesMachineSim.Models
{
    public class WorkOrderDto
    {
        [JsonPropertyName("id")]
        public long Id { get; set; }

        [JsonPropertyName("productCode")]
        public string ProductCode { get; set; }

        [JsonPropertyName("targetQty")]
        public int TargetQty { get; set; }

        [JsonPropertyName("currentQty")]
        public int CurrentQty { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; }
    }
}