// L1_MachineSim/Program.cs
using System;
using System.Net;
using System.Net.Sockets;
using System.Threading;

namespace L1_MachineSim
{
    class Program
    {
        // 서버의 진입점
        static void Main(string[] args)
        {
            TcpListener server = new TcpListener(IPAddress.Any, 5001); // 모든 IP 혀용
            server.Start();
            Console.WriteLine("🏭 [L1 장비 가동] 수집기 접속 대기 중... (Port: 5001)");

            while (true)
            {
                // 수집기(L2)가 접속할 때까지 여기서 대기(Blocking)
                using (TcpClient client = server.AcceptTcpClient())
                using (NetworkStream stream = client.GetStream())
                {
                    Console.WriteLine("▶️ 수집기(L2)가 접속되었습니다.");
                    RunDeviceLoop(client, stream);
                }
                Console.WriteLine("⚠️ 수집기 연결이 종료되었습니다. 다시 대기합니다.");
            }
        }

        static void RunDeviceLoop(TcpClient client, NetworkStream stream)
        {
            Random rand = new Random();
            int tick = 0;

            try
            {
                while (client.Connected)
                {
                    tick++;
                    byte msgType = 0x10; // 실시간 온도 데이터
                    int value = rand.Next(20, 90);

                    // 5초마다 생산 완료 데이터 생성
                    if (tick % 5 == 0)
                    {
                        msgType = 0x20;
                        value = (rand.NextDouble() > 0.1) ? 1 : 0;
                    }

                    // 패킷 생성 및 전송 (STX, Type, Value, ETX)
                    byte[] packet = CreatePacket(msgType, value);
                    stream.Write(packet, 0, packet.Length);

                    Console.WriteLine($"[L1 -> L2] 송신: {msgType:X} | 값: {value}");
                    Thread.Sleep(1000);
                }
            }
            catch { /* 연결 끊김 시 루프 종료 */ }
        }

        static byte[] CreatePacket(byte type, int val)
        {
            byte[] packet = new byte[7];
            packet[0] = 0x02; // STX
            packet[1] = type;
            // 4바이트 형인 정수를 4개의 바이트로 쪼개고 이를 Little Endian 기준으로 변환
            // 20, 0x00000014 => 0x14, 0x00, 0x00, 0x00
            // BitConverter.GetBytes(val): 복사할 원본 (방금 만든 4바이트)
            // 0: 원본의 몇 번째부터 복사할까? (처음부터)
            // packet: 붙여넣을 대상 배열
            // 2: 대상 배열의 어디서부터 붙여넣을까? (index 2번 위치부터)
            // 4: 총 몇 바이트를 복사할까? (int는 4바이트이므로 4)
            Array.Copy(BitConverter.GetBytes(val), 0, packet, 2, 4);
            packet[6] = 0x03; // ETX
            return packet;
        }
    }
}