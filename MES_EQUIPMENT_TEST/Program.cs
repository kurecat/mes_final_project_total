using System;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

class Program
{
    static async Task Main()
    {
        var listener = new TcpListener(IPAddress.Loopback, 5001);
        listener.Start();
        Console.WriteLine("✅ 테스트 서버 시작 (포트 5001)");

        while (true)
        {
            var client = await listener.AcceptTcpClientAsync();
            Console.WriteLine("클라이언트 연결됨");

            _ = Task.Run(() => HandleClient(client));
        }
    }

    static async Task HandleClient(TcpClient client)
    {
        using var stream = client.GetStream();

        while (true)
        {
            try
            {
                // 예시 1: 온도 패킷 (type=0x31)
                byte[] tempPayload = BitConverter.GetBytes(75); // int 75도
                byte[] packet1 = new byte[1 + 1 + 4];
                packet1[0] = 0x01; // SOH
                packet1[1] = 0x31; // type=온도
                Array.Copy(tempPayload, 0, packet1, 2, 4);

                await stream.WriteAsync(packet1, 0, packet1.Length);
                Console.WriteLine("온도 패킷 전송");

                await Task.Delay(2000);

                // 예시 2: 단일 DTO 패킷 (type=0x32)
                var dto = new DicingLogDto { SpindleSpeed = 5000, FeedRate = 1.2 };
                string json = JsonSerializer.Serialize(dto);
                byte[] jsonBytes = Encoding.UTF8.GetBytes(json);

                byte[] sizeBytes = BitConverter.GetBytes((short)(jsonBytes.Length)); // dtoType + JSON
                byte[] packet2 = new byte[1 + 1 + 4 + 1 + jsonBytes.Length];
                packet2[0] = 0x01; // SOH
                packet2[1] = 0x32; // type=단일 DTO
                Array.Copy(sizeBytes, 0, packet2, 2, 2); // size 앞 2바이트
                // 뒤 2바이트는 reserved
                packet2[6] = 0x31; // dtoType = Dicing
                Array.Copy(jsonBytes, 0, packet2, 7, jsonBytes.Length);

                await stream.WriteAsync(packet2, 0, packet2.Length);
                Console.WriteLine("단일 DTO 패킷 전송");

                await Task.Delay(1000);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Server Error] {ex.Message}");
                break;
            }
        }
    }
}

// 테스트용 DTO 정의
public class DicingLogDto
{
    public int SpindleSpeed { get; set; }
    public double FeedRate { get; set; }
}