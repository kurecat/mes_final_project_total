using System;
using System.Drawing;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Threading.Tasks;

public enum DtoType : byte
{
    Dicing = 0x31,
    DicingInspection = 0x32,
    DieBonding = 0x33,
    DieBondingInspection = 0x34,
    WireBonding = 0x35,
    WireBondingInspection = 0x36,
    Molding = 0x37,
    MoldingInspection = 0x38,
    FinalInspectionLog = 0x39,
    ProcessLog = 0x40
}
public class MachineSimulator
{
    private readonly ApiService _apiService;  // Backend Server 통신을 위해 주입 받음
    private readonly TcpClientService _tcpService;  // 장비와 연결하기 위해 주입 받음
    private WorkOrderDto? _currentWorkOrder;

    private ProcessLogDto? _processLogDto;
    private DicingDto? _dicingDto;
    private DicingInspectionDto? _dicingInspectionDto;
    private DieBondingDto? _dieBondingDto;
    private DieBondingInspectionDto? _dieBondingInspectionDto;
    private WireBondingDto? _wireBondingDto;
    private WireBondingInspectionDto? _wireBondingInspectionDto;
    private MoldingDto? _moldingDto;
    private MoldingInspectionDto? _moldingInspectionDto;
    private FinalInspectionLogDto[]? _finalInspectionLogDtos;

    public MachineSimulator(ApiService apiService, TcpClientService tcpService)
    {
        _apiService = apiService;  // 외부에서 만들어진 객체를 주입 받음
        _tcpService = tcpService;
    }

    public async Task RunAsync()
    {
        Console.WriteLine($"🚀 수집기 가동 시작....");

        // 장비 연결 보장
        await ConnectToDeviceAsync();

        // 실시간 장비 데이터 수집 (TCP/IP)
        _ = Task.Run(async () => await ReceiveDeviceDataLoop());

        while (true)
        {
            WorkOrderDto? workOrder = null;

            try
            {
                workOrder = await _apiService.PollWorkOrderAsync(); // 서버에 생산 지시가 있는지 확인
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Poll Error] {ex.Message}");
                await Task.Delay(AppConfig.PollingIntervalMs);
                continue;
            }

            if (workOrder != null)
            {
                _currentWorkOrder = workOrder;
                Console.WriteLine($"작업 수주 : {workOrder.ProductCode} / 목표:{workOrder.TargetQty}");
                await SendWorkOrderToDevice(workOrder);

                await Task.Delay(AppConfig.PollingIntervalMs);
            }
            else
            {
                Console.WriteLine("[-] 현재 할당된 작업이 없습니다.");
                await Task.Delay(AppConfig.PollingIntervalMs); // ✅ 무한 초고속 폴링 방지
            }
        }
    }

    private async Task ConnectToDeviceAsync()
    {
        while (!_tcpService.IsConnected)
        {
            try
            {
                await _tcpService.ConnectAsync("127.0.0.1", 5001);
                Console.WriteLine("L1 장비 연결 성공");
            }
            catch
            {
                Console.WriteLine("L1 연결 실패. 재 시도 중....");
                await Task.Delay(3000);
            }
        }
    }

    private async Task ReceiveDeviceDataLoop()
    {
        while (true)
        {
            try
            {
                if (!_tcpService.IsConnected)
                {
                    await ConnectToDeviceAsync();
                    continue;
                }

                byte[] sohBytes = await _tcpService.ReadPacketAsync(1);
                if (sohBytes == null || sohBytes.Length == 0 || sohBytes[0] != 0x01) continue;

                byte[] typeBytes = await _tcpService.ReadPacketAsync(1);
                if (typeBytes == null || typeBytes.Length == 0) continue;
                byte type = typeBytes[0];

                byte[] payload = await _tcpService.ReadPacketAsync(4);
                if (payload == null || payload.Length < 4) continue;

                if (type == 0x31)   // 온도
                {
                    int val = BitConverter.ToInt16(payload, 0);
                    await HandleTemerature(val);
                }
                else if (type == 0x32)    // 단일 DTO
                {
                    int size = BitConverter.ToInt16(payload, 0);

                    byte[] dtoTypeBytes = await _tcpService.ReadPacketAsync(1);
                    var dtoType = (DtoType)dtoTypeBytes[0];

                    payload = await _tcpService.ReadPacketAsync(size);
                    if (payload == null || payload.Length < size) continue;

                    try
                    {
                        Console.WriteLine($"타입 : {dtoType}");
                        switch (dtoType)
                        {
                            case DtoType.Dicing:
                                _dicingDto = DicingDto.FromBytes(payload);
                                Console.WriteLine($"Dicing: {_dicingDto?.SpindleSpeed}, {_dicingDto?.FeedRate}");
                                break;

                            case DtoType.DicingInspection:
                                _dicingInspectionDto = DicingInspectionDto.FromBytes(payload);
                                Console.WriteLine($"DicingInspection: {_dicingInspectionDto?.OverallPassRatio}");
                                break;

                            case DtoType.DieBonding:
                                _dieBondingDto = DieBondingDto.FromBytes(payload);
                                Console.WriteLine($"DieBonding: {_dieBondingDto?.PickUpForce}, {_dieBondingDto?.CuringTemp}");
                                break;

                            case DtoType.DieBondingInspection:
                                _dieBondingInspectionDto = DieBondingInspectionDto.FromBytes(payload);
                                Console.WriteLine($"DieBondingInspection: {_dieBondingInspectionDto?.OverallPassRatio}");
                                break;

                            case DtoType.WireBonding:
                                _wireBondingDto = WireBondingDto.FromBytes(payload);
                                Console.WriteLine($"WireBonding: {_wireBondingDto?.BondingTemp}, {_wireBondingDto?.LoopHeight}");
                                break;

                            case DtoType.WireBondingInspection:
                                _wireBondingInspectionDto = WireBondingInspectionDto.FromBytes(payload);
                                Console.WriteLine($"WireBondingInspection: {_wireBondingInspectionDto?.OverallPassRatio}");
                                break;

                            case DtoType.Molding:
                                _moldingDto = MoldingDto.FromBytes(payload);
                                Console.WriteLine($"Molding: {_moldingDto?.MoldTemp}, {_moldingDto?.CureTime}");
                                break;

                            case DtoType.MoldingInspection:
                                _moldingInspectionDto = MoldingInspectionDto.FromBytes(payload);
                                Console.WriteLine($"MoldingInspection: {_moldingInspectionDto?.OverallPassRatio}");
                                break;

                            case DtoType.ProcessLog:
                                _processLogDto = ProcessLogDto.FromBytes(payload);
                                Console.WriteLine($"ProcessLog: {_processLogDto?.ProcessLogId}");
                                break;

                            default:
                                Console.WriteLine($"Unknown dtoType: 0x{dtoType:X2}");
                                break;
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[Deserialize Error] DTO 변환 실패: {ex.Message}");
                    }
                }
                else if (type == 0x33)    // 배열 DTO
                {
                    int size = BitConverter.ToInt16(payload, 2);
                    int arrayLength = BitConverter.ToInt16(payload, 0);

                    await _tcpService.ReadPacketAsync(1);   // 타입용바이트                 

                    _finalInspectionLogDtos = new FinalInspectionLogDto[arrayLength];

                    for (int i = 0; i < arrayLength; i++)
                    {
                        try
                        {
                            payload = await _tcpService.ReadPacketAsync(size);
                            if (payload == null || payload.Length < size) continue;
                            Console.WriteLine(payload);
                            PrintByteLog(payload);

                            _finalInspectionLogDtos[i] = FinalInspectionLogDto.FromBytes(payload);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[Deserialize Error] FinalInspection DTO 변환 실패 (index={i}): {ex.Message}");
                        }
                    }
                    await HandleProductionResult();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Loop Error] {ex.Message}");
                await Task.Delay(1000); // 잠시 대기 후 재시도
            }
        }
    }
    private async Task HandleTemerature(int temp)
    {
        var status = new MachineStatusDto
        {
            MachineId = AppConfig.MachineId,
            Temperature = temp
        };

        // 비동기로 전송 (백그라운드 처리)
        _ = Task.Run(() => _apiService.ReportMachineStatusAsync(status));

        if (temp >= 80)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"⚠️ [과열 경고] {temp}℃");
            Console.ResetColor();
        }
    }

    private async Task HandleProductionResult()
    {
        if (_currentWorkOrder == null)
        {
            Console.WriteLine("[WARN] 현재 작업 지시가 없어 생산 결과를 처리할 수 없습니다.");
            return;
        }

        // string serialNo =
        //     $"{_currentWorkOrder.ProductCode}-" +
        //     $"{DateTime.Now:yyyyMMdd}-" +
        //     $"{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";

        var report = new ProductionReportDto
        {
            OrderId = _currentWorkOrder.Id,
            ProcessLogDto = _processLogDto,
            DicingDto = _dicingDto,
            DieBondingDto = _dieBondingDto,
            WireBondingDto = _wireBondingDto,
            MoldingDto = _moldingDto,
            FinalInspectionLogDtos = _finalInspectionLogDtos
        };

        string status = await _apiService.ReportProductionAsync(report);
        Console.WriteLine($"생산 보고 : {report.OrderId}");
    }

    private async Task SendWorkOrderToDevice(WorkOrderDto order)
    {
        if (!_tcpService.IsConnected) return;
        byte[] packet = new byte[7];
        packet[0] = 0x02;  // STX
        packet[1] = 0x20;  // 생산 작업 지시
        Array.Copy(BitConverter.GetBytes(order.TargetQty), 0, packet, 2, 4);
        packet[6] = 0x03;
        await _tcpService.SendAsync(packet);

        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine($"[CMD] 설비에 작업 지시 전달 → 목표 수량: {order.TargetQty}");
        Console.ResetColor();
    }

    public static void PrintByteLog(byte[] data)
    {
        // 각 바이트를 16진수 두 자리로 변환해서 공백으로 구분
        string hex = BitConverter.ToString(data).Replace("-", " ");
        Console.WriteLine($"[ByteLog] {hex}");
    }

}