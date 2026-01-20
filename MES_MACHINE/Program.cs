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
        ArrayData = 0x33
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

    }

    class Program
    {
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

        static void RunDeviceLoop(TcpClient client, NetworkStream stream)
        {
            Random rand = new Random();

            string currentLotId = "LOT-INIT";

            // 상태 변수
            double dicWear = 12.0;
            double dbTemp = 150.0;
            double wbTemp = 250.0;
            double molTemp = 175.0;

            // 2. BinaryWriter 사용을 위한 메모리 스트림 (임시 버퍼)
            // 매번 new 하지 않고 재사용
            using (MemoryStream bodyMs = new MemoryStream())
            using (BinaryWriter writer = new BinaryWriter(bodyMs))
            {
                int count = 0;
                int step = 0;

                Console.WriteLine("--- 전체 공정 시뮬레이션 시작 (Refactored) ---");

                while (client.Connected)
                {
                    Thread.Sleep(500);
                    bodyMs.SetLength(0); // 버퍼 초기화

                    // 온도 패킷 전송
                    double avgTemp = (dbTemp + wbTemp + molTemp) / 3.0;
                    short totalTemp = (short)Math.Round(avgTemp - 120);
                    SendTempPacket(stream, totalTemp);
                    Console.WriteLine($"[TotalTemp] 종합온도 패킷 전송: {totalTemp}℃");

                    if (client.Client.Available > 0)
                    {
                        byte[] readBuffer = new byte[7];
                        int size = stream.Read(readBuffer, 0, readBuffer.Length);
                        if (size == readBuffer.Length && readBuffer[0] == 0x01)
                        {
                            count = BitConverter.ToInt32(readBuffer, 2);
                        }
                    }

                    Console.WriteLine($"count : {count}");
                    Console.WriteLine($"step : {step}");

                    if (count > 0 && step == 0) step = 1;    // 공정시작

                    DtoType procType = DtoType.Sleep;
                    string logMessage = "";
                    bool isArray = false;

                    if (step == 1)
                    {
                        currentLotId = $"LOT-{DateTime.Now:HHmmss}";
                    }

                    // === 공정 데이터 생성 (메서드 분리 권장하지만, 여기선 BinaryWriter 예시를 위해 인라인 처리) ===

                    if (step == 2) // Dicing
                    {
                        procType = DtoType.Dicing;
                        dicWear = Math.Round(dicWear + 0.05, 2);
                        double flow = Math.Round(2.5 + (rand.NextDouble() * 0.2 - 0.1), 2);

                        // ✅ DTO 구조에 맞게 데이터 작성
                        int spindleSpeed = (int)(30000 + rand.Next(-300, 300)); // rpm
                        double feedRate = Math.Round(5.0 + (rand.NextDouble() * 0.4 - 0.2), 2); // mm/s
                        double bladeWear = dicWear; // %
                        double coolantFlow = flow;  // L/min

                        // 패킷에 쓰기
                        writer.Write(spindleSpeed);
                        writer.Write(feedRate);
                        writer.Write(bladeWear);
                        writer.Write(coolantFlow);

                        logMessage = $"[Dicing] 공정 가동.. 마모율: {bladeWear}%, 유량: {coolantFlow}L";
                    }
                    else if (step == 3) // Dicing Insp
                    {
                        procType = DtoType.DicingInspection;
                        double passRate = 97.0;

                        // ✅ DTO 구조에 맞게 데이터 작성
                        int sampleSize = 50;
                        string inspectionCriteria = currentLotId + "-DIC";
                        double thicknessPassRatio = 96.0;
                        double chippingPassRatio = 98.0;
                        double overallPassRatio = passRate;

                        // 패킷에 쓰기
                        writer.Write(sampleSize);

                        // 문자열은 길이 먼저 쓰고, 그 다음 UTF8 바이트
                        byte[] criteriaBytes = System.Text.Encoding.UTF8.GetBytes(inspectionCriteria);
                        writer.Write((short)criteriaBytes.Length);
                        writer.Write(criteriaBytes);
                        writer.Write(thicknessPassRatio);
                        writer.Write(chippingPassRatio);
                        writer.Write(overallPassRatio);

                        logMessage = $"[Dicing] >> 검사 완료 (합격률: {overallPassRatio}%)";
                    }
                    else if (step == 6) // DieBonding
                    {
                        procType = DtoType.DieBonding;

                        // ✅ DTO 구조에 맞는 값 준비
                        double pickUpForce = Math.Round(1.5 + (rand.NextDouble() * 0.2 - 0.1), 2); // 픽업 힘
                        double placementAccuracy = Math.Round(0.05 + (rand.NextDouble() * 0.01 - 0.005), 3); // 배치 정확도
                        double epoxyDispenseVolume = Math.Round(0.8 + (rand.NextDouble() * 0.1 - 0.05), 2); // 에폭시 도포량
                        double curingTemp = Math.Round(150.0 + (rand.NextDouble() * 5 - 2.5), 1); // 경화 온도

                        // ✅ 패킷에 쓰기
                        writer.Write(pickUpForce);
                        writer.Write(placementAccuracy);
                        writer.Write(epoxyDispenseVolume);
                        writer.Write(curingTemp);

                        logMessage = $"[DieBonding] 공정 가동.. 픽업힘:{pickUpForce}, 정확도:{placementAccuracy}, 도포량:{epoxyDispenseVolume}, 온도:{curingTemp}℃";
                    }
                    else if (step == 7) // DieBond Insp
                    {
                        procType = DtoType.DieBondingInspection;
                        double alignmentPass = 94.0;
                        double voidPass = 92.0;
                        double overallPass = 93.0;

                        // ✅ DTO 구조에 맞는 값 준비
                        int sampleSize = 40;        // 샘플링 수량
                        string inspectionCriteria = currentLotId + "-DIE"; // 검사 기준 문자열

                        // ✅ 패킷에 쓰기
                        writer.Write(sampleSize);

                        // 문자열은 길이 먼저 쓰고, 그 다음 UTF8 바이트
                        byte[] criteriaBytes = System.Text.Encoding.UTF8.GetBytes(inspectionCriteria);
                        writer.Write((short)criteriaBytes.Length);
                        writer.Write(criteriaBytes);

                        writer.Write(alignmentPass);
                        writer.Write(voidPass);
                        writer.Write(overallPass);

                        logMessage = $"[DieBonding] >> 검사 완료 (합격률: {overallPass}%)";
                    }
                    else if (step == 10) // WireBonding
                    {
                        procType = DtoType.WireBonding;

                        // ✅ DTO 구조에 맞는 값 준비
                        double bondingTemp = Math.Round(250.0 + (rand.NextDouble() * 10 - 5), 1);   // 본딩 온도 (℃)
                        double bondingForce = Math.Round(0.5 + (rand.NextDouble() * 0.1 - 0.05), 3); // 본딩 힘 (N)
                        double ultrasonicPower = Math.Round(2.0 + (rand.NextDouble() * 0.2 - 0.1), 2); // 초음파 출력 (W)
                        double bondingTime = Math.Round(0.02 + (rand.NextDouble() * 0.005 - 0.0025), 4); // 본딩 시간 (s)
                        double loopHeight = Math.Round(0.15 + (rand.NextDouble() * 0.02 - 0.01), 3); // 루프 높이 (mm)
                        double ballDiameter = Math.Round(0.025 + (rand.NextDouble() * 0.005 - 0.0025), 4); // 볼 직경 (mm)

                        // ✅ 패킷에 쓰기
                        writer.Write(bondingTemp);
                        writer.Write(bondingForce);
                        writer.Write(ultrasonicPower);
                        writer.Write(bondingTime);
                        writer.Write(loopHeight);
                        writer.Write(ballDiameter);

                        logMessage = $"[WireBonding] 공정 가동.. 온도:{bondingTemp}℃, 힘:{bondingForce}N, 초음파:{ultrasonicPower}W, 시간:{bondingTime}s, 루프:{loopHeight}mm, 볼:{ballDiameter}mm";
                    }
                    else if (step == 11) // WireBond Insp
                    {
                        procType = DtoType.WireBondingInspection;

                        // ✅ DTO 구조에 맞는 값 준비
                        int sampleSize = 30;         // 샘플링 수량
                        string inspectionCriteria = currentLotId + "-WB"; // 검사 기준 문자열

                        double pullTestPassRatio = 95.0;
                        double shearTestPassRatio = 96.0;
                        double xrayPassRatio = 98.0;
                        double overallPassRatio = 97.0;

                        // ✅ 패킷에 쓰기
                        writer.Write(sampleSize);

                        // 문자열은 길이 먼저 쓰고, 그 다음 UTF8 바이트
                        byte[] criteriaBytes = System.Text.Encoding.UTF8.GetBytes(inspectionCriteria);
                        writer.Write((short)criteriaBytes.Length);
                        writer.Write(criteriaBytes);

                        writer.Write(pullTestPassRatio);
                        writer.Write(shearTestPassRatio);
                        writer.Write(xrayPassRatio);
                        writer.Write(overallPassRatio);

                        logMessage = $"[WireBonding] >> 검사 완료 (합격률: {overallPassRatio}%)";
                    }
                    else if (step == 14) // Molding
                    {
                        procType = DtoType.Molding;

                        // ✅ DTO 구조에 맞는 값 준비
                        double moldTemp = Math.Round(175.0 + (rand.NextDouble() * 5 - 2.5), 1);       // 금형 온도 (℃)
                        double injectionPressure = Math.Round(80.0 + (rand.NextDouble() * 10 - 5), 1); // 사출 압력 (bar)
                        double cureTime = Math.Round(30.0 + (rand.NextDouble() * 2 - 1), 1);           // 경화 시간 (s)
                        double clampForce = Math.Round(90.0 + (rand.NextDouble() * 5 - 2.5), 1);       // 클램프 힘 (kN)

                        // ✅ 패킷에 쓰기
                        writer.Write(moldTemp);
                        writer.Write(injectionPressure);
                        writer.Write(cureTime);
                        writer.Write(clampForce);

                        logMessage = $"[Molding] 공정 가동.. 온도:{moldTemp}℃, 압력:{injectionPressure}bar, 경화:{cureTime}s, 클램프:{clampForce}kN";
                    }
                    else if (step == 15) // Molding Insp
                    {
                        procType = DtoType.MoldingInspection;

                        // ✅ DTO 구조에 맞는 값 준비
                        int sampleSize = 30;         // 샘플링 수량
                        string inspectionCriteria = currentLotId + "-MOL"; // 검사 기준 문자열

                        double thicknessPassRatio = 95.0;
                        double voidPassRatio = 96.0;
                        double crackPassRatio = 97.0;
                        double overallPassRatio = 96.0;

                        // ✅ 패킷에 쓰기
                        writer.Write(sampleSize);

                        // 문자열은 길이 먼저 쓰고, 그 다음 UTF8 바이트
                        byte[] criteriaBytes = System.Text.Encoding.UTF8.GetBytes(inspectionCriteria);
                        writer.Write((short)criteriaBytes.Length);
                        writer.Write(criteriaBytes);

                        writer.Write(thicknessPassRatio);
                        writer.Write(voidPassRatio);
                        writer.Write(crackPassRatio);
                        writer.Write(overallPassRatio);

                        logMessage = $"[Molding] >> 검사 완료 (합격률: {overallPassRatio}%)";
                    }
                    else if (step == 16) // Final Inspection (Array)
                    {
                        procType = DtoType.FinalInspection;

                        isArray = true;
                        // 배열 길이 랜덤 (예: 1~5개)
                        short arrayLength = (short)rand.Next(1, 6);

                        for (int i = 0; i < arrayLength; i++)
                        {
                            using (MemoryStream itemMs = new MemoryStream())
                            using (BinaryWriter itemWriter = new BinaryWriter(itemMs))
                            {

                                string serialNumber = Guid.NewGuid().ToString();

                                // 문자열 필드들 랜덤
                                string[] electricalOptions = { "Normal", "Abnormal" };
                                string[] reliabilityOptions = { "Pass", "Fail" };
                                string[] visualOptions = { "Good", "Defect", "Average" };
                                string[] finalPassOptions = { "Pass", "Fail" };

                                string electrical = electricalOptions[rand.Next(electricalOptions.Length)];
                                string reliability = reliabilityOptions[rand.Next(reliabilityOptions.Length)];
                                string visual = visualOptions[rand.Next(visualOptions.Length)];
                                string finalPass = finalPassOptions[rand.Next(finalPassOptions.Length)];

                                WritePacketString(itemWriter, serialNumber);
                                WritePacketString(itemWriter, finalPass);

                                // body 완성
                                byte[] body = itemMs.ToArray();

                                // 헤더 붙이기
                                writer.Write((short)body.Length);   // size
                                writer.Write((byte)DtoType.Item);   // type
                                writer.Write(body);                 // body

                                itemMs.SetLength(0);

                                WritePacketString(itemWriter, electrical);
                                WritePacketString(itemWriter, reliability);
                                WritePacketString(itemWriter, visual);
                                WritePacketString(itemWriter, finalPass);

                                body = itemMs.ToArray();

                                writer.Write((short)body.Length);
                                writer.Write((byte)DtoType.FinalInspection);
                                writer.Write(body);
                            }
                        }
                        byte[] packetBytes = bodyMs.ToArray();
                        Console.WriteLine($"총 패킷 길이: {packetBytes.Length} 바이트, 아이템 수: {arrayLength}");
                        logMessage = "[★FINAL] 최종검사 배열 Data 전송 완료";

                        dicWear = 12.0; // Reset wear

                        step = 0;
                        count--;
                    }
                    else
                    {
                        procType = DtoType.Processing;
                    }

                    if (step > 0) step++;

                    if (procType != DtoType.Sleep && procType != DtoType.Processing)
                    {
                        // 패킷 조립 및 전송 (공통 로직)
                        byte[] bodyBytes = bodyMs.ToArray();

                        if (isArray)
                            SendDtoArrayPacket(stream, bodyBytes);
                        else
                            SendDtoPacket(stream, procType, bodyBytes);

                        if (!string.IsNullOrEmpty(logMessage))
                            Console.WriteLine(logMessage);
                    }
                }
            }
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