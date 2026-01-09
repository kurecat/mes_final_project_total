namespace MesMachineSim.Config
{
    public static class AppConfig
    {
        public const string BaseUrl = "http://localhost:8111/";
        public const string MachineId = "LINE-01-M01"; // 설비 고유 명칭
        public const int PollingIntervalMs = 5000;      // 5초마다 확인
    }
}