public static class UserSession
{
    public static long? MemberId { get; set; }
    public static string? WorkerCode { get; set; }

    public static void Clear()
    {
        MemberId = null;
        WorkerCode = null;
    }
}