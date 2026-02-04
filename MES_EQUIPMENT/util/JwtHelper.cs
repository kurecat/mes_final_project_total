using System;
using System.Text;
using System.Text.Json;

public class JwtHelper
{
    public static long GetMemberId(string token)
    {
        var parts = token.Split('.');
        if (parts.Length < 2)
            throw new ArgumentException("잘못된 JWT 형식입니다.");

        string payload = parts[1];

        // Base64Url → Base64 변환
        payload = payload.Replace('-', '+').Replace('_', '/');
        switch (payload.Length % 4)
        {
            case 2: payload += "=="; break;
            case 3: payload += "="; break;
        }

        var bytes = Convert.FromBase64String(payload);
        var json = Encoding.UTF8.GetString(bytes);

        using var doc = JsonDocument.Parse(json);

        // workerId 꺼내기 (sub에 넣었을 경우)
        if (doc.RootElement.TryGetProperty("sub", out var sub))
        {
            if (long.TryParse(sub.GetString(), out long workerId))
                return workerId;
        }

        // workerId라는 커스텀 클레임에 넣었을 경우
        if (doc.RootElement.TryGetProperty("workerId", out var workerIdProp))
        {
            if (long.TryParse(workerIdProp.ToString(), out long workerId))
                return workerId;
        }

        throw new Exception("workerId를 찾을 수 없습니다.");
    }
}