using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using Microsoft.VisualBasic;

namespace L1_MachineSim
{
    // 1. 매직 넘버를 Enum으로 정의하여 가독성 확보
    public enum MsgType : byte
    {
        Temperature = 0x31,
        SingleData = 0x32,
        ArrayData = 0x33,
        ProductionEnd = 0x34
    }

    public enum DtoType : byte
    {
        Sleep = 0x30,
        Processing = 0x31,

        Dicing = 0x32,
        DicingInspection = 0x33,
        DieBonding = 0x34,
        DieBondingInspection = 0x35,
        WireBonding = 0x36,
        WireBondingInspection = 0x37,
        Molding = 0x38,
        MoldingInspection = 0x39,

        Item = 0x3A,
        FinalInspection = 0x3B,
        InputLot = 0x3C,
    }

    class Program
    {
        // 상태 관리 클래스
        public static class Device
        {
            public static double DicWear = 12.0;
            public static double DbTemp = 150.0;
            public static double WbTemp = 250.0;
            public static double MolTemp = 175.0;
            public static Random Rand = new Random();
            public static string? ProductCode = "";

            public static void Reset()
            {
                DicWear = 12.0;
            }
        }
        static void Main(string[] args)
        {
            TcpListener server = new TcpListener(IPAddress.Any, 5001);
            server.Start();
            Console.WriteLine("🏭 [L1 장비 가동] 수집기 접속 대기 중... (Port: 5001)");

            while (true)
            {
                try
                {
                    using (TcpClient client = server.AcceptTcpClient())
                    using (NetworkStream stream = client.GetStream())
                    {
                        Console.WriteLine("▶️ 수집기(L2)가 접속되었습니다.");

                        RunDeviceLoop(client, stream);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️ 에러 발생: {ex.Message}");
                }
                Console.WriteLine("⚠️ 수집기 연결이 종료되었습니다. 다시 대기합니다.");
            }
        }

        public static void RunDeviceLoop(TcpClient client, NetworkStream stream)
        {
            Console.WriteLine("--- 전체 공정 시뮬레이션 시작 (Direct Logging) ---");

            using (MemoryStream bodyMs = new MemoryStream())
            using (BinaryWriter writer = new BinaryWriter(bodyMs))
            {

                int step = 0;

                while (client.Connected)
                {
                    // 1. 주기적 온도 패킷 (항상 전송)
                    double avgTemp = (Device.DbTemp + Device.DbTemp + Device.MolTemp) / 3.0;

                    short totalTemp = (short)Math.Round(avgTemp - 120);

                    SendTempPacket(stream, totalTemp);

                    Console.WriteLine($"[TotalTemp] 종합온도 패킷 전송: {totalTemp}℃");

                    // 2. 대기 상태 (Step 0)
                    if (step == 0)
                    {
                        if (client.Client.Available > 0)
                        {
                            // 작업지시 바이트 배열 받기
                            byte[] readBuffer = new byte[4];
                            int size = stream.Read(readBuffer, 0, readBuffer.Length);

                            if (size == readBuffer.Length && readBuffer[0] == 0x01)
                            {
                                if (readBuffer[1] == 0x31)
                                {
                                    int len = BitConverter.ToInt16(readBuffer, 2);

                                    readBuffer = new byte[len];
                                    size = stream.Read(readBuffer, 0, readBuffer.Length);

                                    Device.ProductCode = System.Text.Encoding.UTF8.GetString(readBuffer, 0, size);
                                    step = 1;
                                }
                            }
                        }
                        else
                        {
                            Thread.Sleep(500);
                            continue;
                        }
                    }

                    // 3. 공정 데이터 생성
                    bodyMs.SetLength(0); // 버퍼 초기화
                    DtoType procType = DtoType.Processing;
                    bool isArrayPacket = false;

                    switch (step)
                    {
                        case 2: // Dicing
                            procType = DtoType.Dicing;
                            ProcessDicing(writer);
                            break;

                        case 3: // Dicing Inspection
                            procType = DtoType.DicingInspection;
                            ProcessDicingInspection(writer);
                            break;

                        case 5: // Die Bonding
                            procType = DtoType.DieBonding;
                            ProcessDieBonding(writer);
                            break;

                        case 6: // Die Bonding Inspection
                            procType = DtoType.DieBondingInspection;
                            ProcessDieBondingInspection(writer);
                            break;

                        case 8: // Wire Bonding
                            procType = DtoType.WireBonding;
                            ProcessWireBonding(writer);
                            break;

                        case 9: // Wire Bonding Inspection
                            procType = DtoType.WireBondingInspection;
                            ProcessWireBondingInspection(writer);
                            break;

                        case 11: // Molding
                            procType = DtoType.Molding;
                            ProcessMolding(writer);
                            break;

                        case 12: // Molding Inspection
                            procType = DtoType.MoldingInspection;
                            ProcessMoldingInspection(writer);
                            break;

                        case 14: // Final Inspection (Array)
                            procType = DtoType.FinalInspection;
                            isArrayPacket = true;
                            ProcessFinalInspectionArray(writer);
                            break;

                        case 15: // InputLot 정리 (Array)
                            procType = DtoType.InputLot;
                            isArrayPacket = true;
                            ProcessInputLotSummary(writer);
                            break;

                        case 16: // 사이클 종료 및 초기화
                            procType = DtoType.Sleep;
                            byte[] packet = [
                                0x01,                          // Header
                                (byte)MsgType.ProductionEnd    // Message Type
                            ];
                            stream.Write(packet, 0, packet.Length);
                            step = -1;
                            break;

                        default:
                            // 이동 중(Processing)
                            procType = DtoType.Processing;
                            break;
                    }

                    // 4. 패킷 전송 (데이터가 있을 때만)

                    if (procType != DtoType.Processing && procType != DtoType.Sleep)
                    {
                        byte[] bodyBytes = bodyMs.ToArray();
                        if (isArrayPacket)
                            SendDtoArrayPacket(stream, bodyBytes);
                        else
                            SendDtoPacket(stream, procType, bodyBytes);
                    }

                    step++;
                    Thread.Sleep(100);
                }
            }
        }

        private static void ProcessDicing(BinaryWriter writer)
        {
            Device.DicWear = Math.Round(Device.DicWear + 0.05, 2);
            double flow = Math.Round(2.5 + (Device.Rand.NextDouble() * 0.2 - 0.1), 2);

            int spindleSpeed = (int)(30000 + Device.Rand.Next(-300, 300));
            double feedRate = Math.Round(5.0 + (Device.Rand.NextDouble() * 0.4 - 0.2), 2);

            writer.Write(spindleSpeed);
            writer.Write(feedRate);
            writer.Write(Device.DicWear);
            writer.Write(flow);

            Console.WriteLine($"[Dicing] 마모율: {Device.DicWear}%, 유량: {flow}L");
        }

        private static void ProcessDicingInspection(BinaryWriter writer)
        {
            int sampleSize = 50;
            string criteria = Device.ProductCode + "-DIC";
            double overallPass = 97.0;

            writer.Write(sampleSize);
            WritePacketString(writer, criteria);
            writer.Write(96.0);
            writer.Write(98.0);
            writer.Write(overallPass);

            Console.WriteLine($"[Dicing Insp] 검사 완료 (합격률: {overallPass}%)");
        }

        private static void ProcessDieBonding(BinaryWriter writer)
        {
            double force = Math.Round(1.5 + (Device.Rand.NextDouble() * 0.2 - 0.1), 2);
            double accuracy = Math.Round(0.05 + (Device.Rand.NextDouble() * 0.01 - 0.005), 3);
            double epoxy = Math.Round(0.8 + (Device.Rand.NextDouble() * 0.1 - 0.05), 2);
            double temp = Math.Round(150.0 + (Device.Rand.NextDouble() * 5 - 2.5), 1);

            writer.Write(force);
            writer.Write(accuracy);
            writer.Write(epoxy);
            writer.Write(temp);

            Console.WriteLine($"[DieBonding] 픽업:{force}, 정확도:{accuracy}, 도포:{epoxy}, 온도:{temp}℃");
        }

        private static void ProcessDieBondingInspection(BinaryWriter writer)
        {
            int sampleSize = 40;
            string criteria = Device.ProductCode + "-DIE";
            double overallPass = 93.0;

            writer.Write(sampleSize);
            WritePacketString(writer, criteria);
            writer.Write(94.0);
            writer.Write(92.0);
            writer.Write(overallPass);

            Console.WriteLine($"[DieBond Insp] 검사 완료 (합격률: {overallPass}%)");
        }

        private static void ProcessWireBonding(BinaryWriter writer)
        {
            double temp = Math.Round(250.0 + (Device.Rand.NextDouble() * 10 - 5), 1);
            double force = Math.Round(0.5 + (Device.Rand.NextDouble() * 0.1 - 0.05), 3);
            double power = Math.Round(2.0 + (Device.Rand.NextDouble() * 0.2 - 0.1), 2);
            double time = Math.Round(0.02 + (Device.Rand.NextDouble() * 0.005 - 0.0025), 4);
            double loop = Math.Round(0.15 + (Device.Rand.NextDouble() * 0.02 - 0.01), 3);
            double ball = Math.Round(0.025 + (Device.Rand.NextDouble() * 0.005 - 0.0025), 4);

            writer.Write(temp);
            writer.Write(force);
            writer.Write(power);
            writer.Write(time);
            writer.Write(loop);
            writer.Write(ball);

            Console.WriteLine($"[WireBonding] 온도:{temp}℃, 힘:{force}N, 시간:{time}s");
        }

        private static void ProcessWireBondingInspection(BinaryWriter writer)
        {
            int sampleSize = 30;
            string criteria = Device.ProductCode + "-WB";
            double overallPass = 97.0;

            writer.Write(sampleSize);
            WritePacketString(writer, criteria);
            writer.Write(95.0);
            writer.Write(96.0);
            writer.Write(98.0);
            writer.Write(overallPass);

            Console.WriteLine($"[WireBond Insp] 검사 완료 (합격률: {overallPass}%)");
        }

        private static void ProcessMolding(BinaryWriter writer)
        {
            double temp = Math.Round(175.0 + (Device.Rand.NextDouble() * 5 - 2.5), 1);
            double pressure = Math.Round(80.0 + (Device.Rand.NextDouble() * 10 - 5), 1);
            double time = Math.Round(30.0 + (Device.Rand.NextDouble() * 2 - 1), 1);
            double clamp = Math.Round(90.0 + (Device.Rand.NextDouble() * 5 - 2.5), 1);

            writer.Write(temp);
            writer.Write(pressure);
            writer.Write(time);
            writer.Write(clamp);

            Console.WriteLine($"[Molding] 온도:{temp}℃, 압력:{pressure}bar");
        }

        private static void ProcessMoldingInspection(BinaryWriter writer)
        {
            int sampleSize = 30;
            string criteria = Device.ProductCode + "-MOL";
            double overallPass = 96.0;

            writer.Write(sampleSize);
            WritePacketString(writer, criteria);
            writer.Write(95.0);
            writer.Write(96.0);
            writer.Write(97.0);
            writer.Write(overallPass);

            Console.WriteLine($"[Molding Insp] 검사 완료 (합격률: {overallPass}%)");
        }

        private static void ProcessFinalInspectionArray(BinaryWriter writer)
        {
            short arrayLength = (short)Device.Rand.Next(1, 6);
            string[] elecOpts = { "Normal", "Abnormal" };
            string[] relOpts = { "Pass", "Fail" };
            string[] visOpts = { "Good", "Defect", "Average" };
            string[] passOpts = { "Pass", "Fail" };

            using (MemoryStream itemMs = new MemoryStream())
            using (BinaryWriter itemWriter = new BinaryWriter(itemMs))
            {
                for (int i = 0; i < arrayLength; i++)
                {
                    string serial = Guid.NewGuid().ToString();
                    string electrical = elecOpts[Device.Rand.Next(elecOpts.Length)];
                    string reliability = relOpts[Device.Rand.Next(relOpts.Length)];
                    string visual = visOpts[Device.Rand.Next(visOpts.Length)];
                    string finalPass = passOpts[Device.Rand.Next(passOpts.Length)];

                    DateTime endTime = DateTime.Now.AddSeconds(Device.Rand.Next(-5, 6));
                    byte[] timeBytes = BitConverter.GetBytes(endTime.Ticks);

                    // Item Packet
                    itemMs.SetLength(0);
                    WritePacketString(itemWriter, serial);
                    WritePacketString(itemWriter, finalPass);
                    byte[] itemBody = itemMs.ToArray();

                    writer.Write((short)itemBody.Length);
                    writer.Write((byte)DtoType.Item);
                    writer.Write(itemBody);

                    // FinalInspection Packet
                    itemMs.SetLength(0);
                    WritePacketString(itemWriter, electrical);
                    WritePacketString(itemWriter, reliability);
                    WritePacketString(itemWriter, visual);
                    WritePacketString(itemWriter, finalPass);
                    itemWriter.Write(timeBytes);
                    byte[] finalBody = itemMs.ToArray();

                    writer.Write((short)finalBody.Length);
                    writer.Write((byte)DtoType.FinalInspection);
                    writer.Write(finalBody);
                }
            }

            Console.WriteLine($"[Final Insp] 최종검사 배열 Data 전송 완료 (수량: {arrayLength})");
        }

        private static void ProcessInputLotSummary(BinaryWriter writer)
        {
            string[] inputLots = {
                "LOT-20260122-01", // 웨이퍼
                "LOT-20260122-02", // 패키지 기판
                "LOT-20260122-03", // 언더필 수지
                "LOT-20260122-04", // 금 와이어
                "LOT-20260122-05", // 리드프레임
                "LOT-20260122-06", // 솔더 볼
                "LOT-20260122-07", // 몰딩 컴파운드
                "LOT-20260122-08"  // 에폭시 봉지재
            };

            foreach (string inputLot in inputLots)
            {
                byte[] body = System.Text.Encoding.UTF8.GetBytes(inputLot);
                writer.Write((short)body.Length);
                writer.Write((byte)DtoType.InputLot);
                writer.Write(body);
            }

            Console.WriteLine($"[★] InputLotSummary 배열 Data 전송 완료");
        }

        // --- 헬퍼 메서드: 문자열 쓰기 (길이 + 본문) ---
        static void WritePacketString(BinaryWriter writer, string text)
        {
            byte[] bytes = Encoding.UTF8.GetBytes(text);
            writer.Write((short)bytes.Length); // 2byte Length
            writer.Write(bytes);               // Body
        }

        // --- 패킷 전송 메서드 (데이터용) ---
        static void SendDtoArrayPacket(NetworkStream stream, byte[] body)
        {
            // 헤더(4~6바이트) + 바디(N바이트)
            // Header(1) + MsgType(1) + Length/Count(2) + BodyLength(2) + ProcType(1) + Body(N) ... 구조 통일
            // 여기서는 기존 로직에 맞춰 최적화

            List<byte> packet = new List<byte>();
            packet.Add(0x01);           // Header
            packet.Add((byte)MsgType.ArrayData);  // MsgType

            packet.AddRange(body);      // Data
            packet.Add(0x00);
            packet.Add(0x00);   // end (다음객체의크기)

            byte[] finalPacket = packet.ToArray();
            stream.Write(finalPacket, 0, finalPacket.Length);

            PrintByteLog(finalPacket);
        }

        static void SendDtoPacket(NetworkStream stream, DtoType procType, byte[] body)
        {
            // 헤더(4~6바이트) + 바디(N바이트)
            // Header(1) + MsgType(1) + Length/Count(2) + BodyLength(2) + ProcType(1) + Body(N) ... 구조 통일
            // 여기서는 기존 로직에 맞춰 최적화

            List<byte> packet = new List<byte>();
            packet.Add(0x01);           // Header
            packet.Add((byte)MsgType.SingleData);  // MsgType

            packet.AddRange(BitConverter.GetBytes((short)body.Length)); // Body Length (공통)

            packet.Add((byte)procType); // Specific Type
            packet.AddRange(body);      // Data

            byte[] finalPacket = packet.ToArray();
            stream.Write(finalPacket, 0, finalPacket.Length);

            PrintByteLog(finalPacket);
        }

        // --- 패킷 전송 메서드 (온도용) ---
        static void SendTempPacket(NetworkStream stream, short temp)
        {
            List<byte> packet = new List<byte>();
            packet.Add(0x01);
            packet.Add((byte)MsgType.Temperature);
            packet.AddRange(BitConverter.GetBytes(temp));

            byte[] finalPacket = packet.ToArray();
            stream.Write(finalPacket, 0, finalPacket.Length);
        }

        public static void PrintByteLog(byte[] data)
        {
            // 각 바이트를 16진수 두 자리로 변환해서 공백으로 구분
            string hex = BitConverter.ToString(data).Replace("-", " ");
            Console.WriteLine($"[ByteLog] {hex}");
        }
    }

}