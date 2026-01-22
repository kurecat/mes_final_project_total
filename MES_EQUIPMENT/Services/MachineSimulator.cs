using System;
using System.Collections;
using System.Drawing;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Threading.Tasks;

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
public class MachineSimulator
{
    private readonly ApiService _apiService;  // Backend Server 통신을 위해 주입 받음
    private readonly TcpClientService _tcpService;  // 장비와 연결하기 위해 주입 받음
    private WorkOrderDto? _currentWorkOrder = null;

    private DicingDto? _dicingDto;
    private DicingInspectionDto? _dicingInspectionDto;
    private DieBondingDto? _dieBondingDto;
    private DieBondingInspectionDto? _dieBondingInspectionDto;
    private WireBondingDto? _wireBondingDto;
    private WireBondingInspectionDto? _wireBondingInspectionDto;
    private MoldingDto? _moldingDto;
    private MoldingInspectionDto? _moldingInspectionDto;
    private List<ItemDto> _itemDtos = new List<ItemDto>();
    private List<FinalInspectionDto> _finalInspectionDtos = new List<FinalInspectionDto>();
    private List<string> _inputLots = new List<string>();

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
            if (_currentWorkOrder != null)
            {
                await Task.Delay(AppConfig.PollingIntervalMs);
                continue;
            }

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
                Console.WriteLine($"[작업 수주] 번호 : {workOrder.Id}, 작업량 : {workOrder.CurrentQty} / {workOrder.TargetQty}");
                await SendWorkOrderToDevice(workOrder);

            }
            else if (workOrder == null)
            {
                Console.WriteLine("[-] 대기중인 작업이 없습니다.");
            }
            await Task.Delay(AppConfig.PollingIntervalMs); // ✅ 무한 초고속 폴링 방지
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

                byte[] payload = await _tcpService.ReadPacketAsync(2);
                if (payload == null || payload.Length < 2) continue;

                if (type == (byte)MsgType.Temperature)   // 온도
                {
                    short val = BitConverter.ToInt16(payload, 0);
                    await HandleTemerature(val);
                }
                else if (type == (byte)MsgType.SingleData)    // 단일 DTO
                {
                    int size = BitConverter.ToInt16(payload, 0);

                    DtoType dtoType = (DtoType)(await _tcpService.ReadPacketAsync(1))[0];

                    payload = await _tcpService.ReadPacketAsync(size);
                    if (payload == null || payload.Length < size) continue;

                    try
                    {
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
                else if (type == (byte)MsgType.ArrayData)    // 배열 DTO
                {
                    int size = BitConverter.ToInt16(payload, 0);

                    while (size > 0)
                    {
                        // 타입용바이트
                        DtoType dtoType = (DtoType)(await _tcpService.ReadPacketAsync(1))[0];

                        payload = await _tcpService.ReadPacketAsync(size);
                        if (payload == null || payload.Length < size) continue;

                        try
                        {
                            switch (dtoType)
                            {
                                case DtoType.Item:
                                    _itemDtos?.Add(ItemDto.FromBytes(payload));
                                    Console.WriteLine($"Item: {_itemDtos?.Count}");
                                    break;
                                case DtoType.FinalInspection:
                                    _finalInspectionDtos?.Add(FinalInspectionDto.FromBytes(payload));
                                    Console.WriteLine($"FinalInspection: {_finalInspectionDtos?.Count}");
                                    break;
                                case DtoType.InputLot:
                                    _inputLots?.Add(System.Text.Encoding.UTF8.GetString(payload, 0, size));
                                    Console.WriteLine($"InputLotSummary: {_inputLots?.Count}");
                                    break;
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[Deserialize Error] 배열 DTO 변환 실패 : {ex.Message}");
                        }

                        size = BitConverter.ToInt16(await _tcpService.ReadPacketAsync(2));
                    }
                }
                else if (type == (byte)MsgType.ProductionEnd)
                {
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
    private async Task HandleTemerature(short temp)
    {
        var status = new MachineStatusDto
        {
            EquipmentId = AppConfig.EquipmentId,
            Temperature = temp
        };

        // 비동기로 전송 (백그라운드 처리)
        //_ = Task.Run(() => _apiService.ReportMachineStatusAsync(status));

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

        var report = new ProductionReportDto
        {
            WorkOrderId = _currentWorkOrder.Id,
            DicingDto = _dicingDto,
            DicingInspectionDto = _dicingInspectionDto,
            DieBondingDto = _dieBondingDto,
            DieBondingInspectionDto = _dieBondingInspectionDto,
            WireBondingDto = _wireBondingDto,
            WireBondingInspectionDto = _wireBondingInspectionDto,
            MoldingDto = _moldingDto,
            MoldingInspectionDto = _moldingInspectionDto,
            ItemDtos = _itemDtos.ToArray(),
            FinalInspectionDtos = _finalInspectionDtos.ToArray(),
            InputLots = _inputLots.ToArray()
        };

        string status = await _apiService.ReportProductionAsync(report);
        Console.WriteLine($"[생산 보고] 작업지시번호 : {report.WorkOrderId}");

        _currentWorkOrder = null;

        _itemDtos.Clear();
        _finalInspectionDtos.Clear();
        _inputLots.Clear();

    }

    private async Task SendWorkOrderToDevice(WorkOrderDto order)
    {
        if (order.ProductId == null)
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine($"[WORN] 작업지시서 오류, 작업취소");
            Console.ResetColor();

            _currentWorkOrder = null;

            return;
        }

        if (!_tcpService.IsConnected) return;

        _currentWorkOrder = order;

        byte[] productCodeBody = System.Text.Encoding.UTF8.GetBytes(order.ProductId);
        byte[] packet = new byte[4 + productCodeBody.Length];
        packet[0] = 0x01;  // STX
        packet[1] = 0x31;  // 생산 작업 지시
        Array.Copy(BitConverter.GetBytes(productCodeBody.Length), 0, packet, 2, 2);
        Array.Copy(productCodeBody, 0, packet, 4, productCodeBody.Length);
        await _tcpService.SendAsync(packet);

        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine($"[CMD] 설비에 작업 지시 전달 → 남은 수량: {order.TargetQty - order.CurrentQty}");
        Console.ResetColor();
    }

    public static void PrintByteLog(byte[] data)
    {
        // 각 바이트를 16진수 두 자리로 변환해서 공백으로 구분
        string hex = BitConverter.ToString(data).Replace("-", " ");
        Console.WriteLine($"[ByteLog] {hex}");
    }

}