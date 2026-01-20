using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;

namespace L1_MachineSim
{
    // [Enum 정의는 그대로 유지]
    public enum MsgType : byte { Temperature = 0x31, SingleData = 0x32, ArrayData = 0x33 }
    public enum DtoType : byte
    {
        Processing = 0x30, Dicing = 0x31, DicingInspection = 0x32,
        DieBonding = 0x33, DieBondingInspection = 0x34, WireBonding = 0x35, WireBondingInspection = 0x36,
        Molding = 0x37, MoldingInspection = 0x38, FinalInspectionLog = 0x39
    }

    class Program
    {
        static void Main()
        {
            TcpListener server = new TcpListener(IPAddress.Any, 5001);
            server.Start();
            Console.WriteLine("🏭 [L1 장비] 최종 경량화 버전 가동 (Port: 5001)");

            while (true)
            {
                try
                {
                    using (var client = server.AcceptTcpClient())
                    using (var stream = client.GetStream())
                    {
                        Console.WriteLine("▶️ 연결됨");
                        RunLoop(client, stream);
                    }
                }
                catch (Exception ex) { Console.WriteLine($"⚠️ 에러: {ex.Message}"); }
            }
        }

        static void RunLoop(TcpClient client, NetworkStream stream)
        {
            int tick = 0;
            string lotId = "LOT-INIT";
            double wear = 12.0;

            // 데이터 생성용 메모리 버퍼 (재사용)
            using (var ms = new MemoryStream())
            using (var w = new BinaryWriter(ms))
            {
                while (client.Connected)
                {
                    int step = tick % 18;
                    if (step == 0) lotId = $"LOT-{DateTime.Now:HHmmss}";
                    
                    ms.SetLength(0); // 버퍼 초기화
                    DtoType? type = null;
                    string log = "";

                    // === 1. 공정 데이터 생성 (간결해진 로직) ===
                    switch (step)
                    {
                        case 2: // Dicing
                            type = DtoType.Dicing;
                            wear += 0.05;
                            w.Write((int)Rand.Val(30000, 300)); // Spindle
                            w.Write(Rand.Val(5.0, 0.2));        // Feed
                            w.Write(Math.Round(wear, 2));       // Wear
                            w.Write(Rand.Val(2.5, 0.1));        // Flow
                            log = $"[Dicing] 마모: {wear:F2}%";
                            break;

                        case 6: // Die Bonding
                            type = DtoType.DieBonding;
                            w.Write(Rand.Val(1.5, 0.1));   // Force
                            w.Write(Rand.Val(0.05, 0.005, 3)); // Accuracy
                            w.Write(Rand.Val(0.8, 0.05));  // Epoxy
                            w.Write(Rand.Val(150, 2.5, 1)); // Temp
                            log = "[DieBonding] 가동";
                            break;

                        case 10: // Wire Bonding
                            type = DtoType.WireBonding;
                            w.Write(Rand.Val(250, 5, 1));    // Temp
                            w.Write(Rand.Val(0.5, 0.05, 3)); // Force
                            w.Write(Rand.Val(2.0, 0.1));     // Power
                            w.Write(Rand.Val(0.02, 0.0025, 4)); // Time
                            w.Write(Rand.Val(0.15, 0.01, 3));   // Loop
                            w.Write(Rand.Val(0.025, 0.0025, 4));// Ball
                            log = "[WireBonding] 가동";
                            break;

                        case 14: // Molding
                            type = DtoType.Molding;
                            w.Write(Rand.Val(175, 2.5, 1)); // Temp
                            w.Write(Rand.Val(80, 5, 1));    // Pressure
                            w.Write(Rand.Val(30, 1, 1));    // Time
                            w.Write(Rand.Val(90, 2.5, 1));  // Clamp
                            log = "[Molding] 가동";
                            break;

                        // 검사 로직들 (패턴화)
                        case 3:  GenerateInsp(w, DtoType.DicingInspection, lotId, "DIC", 97.0, out type, out log); break;
                        case 7:  GenerateInsp(w, DtoType.DieBondingInspection, lotId, "DIE", 93.0, out type, out log); break;
                        case 11: GenerateInsp(w, DtoType.WireBondingInspection, lotId, "WB", 96.0, out type, out log); break;
                        case 15: GenerateInsp(w, DtoType.MoldingInspection, lotId, "MOL", 96.0, out type, out log); break;

                        case 16: // Final Array
                            type = DtoType.FinalInspectionLog;
                            int cnt = (int)Rand.Val(3, 2); // 1~5개
                            for(int i=0; i<cnt; i++) {
                                // 배열 아이템 직접 구성
                                byte[] item = PacketUtil.MakeItemBytes(w2 => {
                                    w2.WriteStr(Guid.NewGuid().ToString());
                                    w2.WriteStr("Normal"); w2.WriteStr("Pass");
                                    w2.WriteStr("Good");   w2.WriteStr("Pass");
                                });
                                // Array Item Header (Size + Type + Body)
                                w.Write((short)item.Length);
                                w.Write((byte)0x39);
                                w.Write(item);
                            }
                            wear = 12.0; // Reset
                            log = $"[Final] {cnt}EA 전송";
                            break;
                    }

                    // === 2. 전송 (Buffer -> Stream) ===
                    if (type.HasValue)
                    {
                        byte[] data = ms.ToArray();
                        PacketUtil.Send(stream, type == DtoType.FinalInspectionLog ? MsgType.ArrayData : MsgType.SingleData, type.Value, data);
                        if(log != "") Console.WriteLine(log);
                    }

                    // 온도 전송
                    PacketUtil.SendTemp(stream, (short)Rand.Val(150, 5));
                    
                    Thread.Sleep(500);
                    tick++;
                }
            }
        }

        // 공통 검사 데이터 생성 헬퍼
        static void GenerateInsp(BinaryWriter w, DtoType dType, string lot, string suffix, double rate, out DtoType? type, out string log)
        {
            type = dType;
            w.Write(50); // Sample
            w.WriteStr($"{lot}-{suffix}");
            // 간단하게 합격률 3~4개 채우기 (검사마다 필드 수 다르지만 예시로 통일하거나 필요한만큼 Write 추가)
            w.Write(rate - 1); w.Write(rate + 1); 
            if(dType != DtoType.DieBondingInspection) w.Write(rate + 0.5); // 필드 개수 맞추기용
            w.Write(rate); // Overall
            log = $"[{suffix}] 검사완료 ({rate}%)";
        }
    }

    // === 유틸리티 클래스 (복잡한 로직 은닉) ===
    static class PacketUtil
    {
        public static void Send(NetworkStream s, MsgType mType, DtoType? dType, byte[] body)
        {
            // 헤더(1) + 타입(1) + 길이(2) + [상세타입(1)] + 바디
            var list = new System.Collections.Generic.List<byte> { 0x01, (byte)mType };
            list.AddRange(BitConverter.GetBytes((short)body.Length)); // Body Length
            if (dType.HasValue && mType != MsgType.ArrayData) list.Add((byte)dType); // Array는 상세타입 안 붙임(예제기준)
            list.AddRange(body);
            if (mType == MsgType.ArrayData) { list.Add(0x00); list.Add(0x00); } // End Token

            byte[] pkt = list.ToArray();
            s.Write(pkt, 0, pkt.Length);
        }

        public static void SendTemp(NetworkStream s, short temp)
        {
            // 온도 패킷 단순화
            byte[] tBytes = BitConverter.GetBytes(temp);
            s.Write(new byte[] { 0x01, (byte)MsgType.Temperature, tBytes[0], tBytes[1] }, 0, 4);
        }

        // 배열 내부 아이템 바이트 생성기
        public static byte[] MakeItemBytes(Action<BinaryWriter> action)
        {
            using (var ms = new MemoryStream())
            using (var w = new BinaryWriter(ms)) {
                action(w);
                return ms.ToArray();
            }
        }
    }

    // === 확장 메서드 및 랜덤 헬퍼 ===
    static class Extensions
    {
        // 문자열 쓰기 단축 (Length + String)
        public static void WriteStr(this BinaryWriter w, string s)
        {
            byte[] b = Encoding.UTF8.GetBytes(s);
            w.Write((short)b.Length);
            w.Write(b);
        }
    }

    static class Rand
    {
        private static Random _r = new Random();
        // 기준값(base)에서 ±range 만큼 랜덤 (소수점 digits자리)
        public static double Val(double b, double range, int digits = 2) 
            => Math.Round(b + (_r.NextDouble() * range * 2 - range), digits);
    }
}