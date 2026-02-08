using System;
using System.Collections;
using System.Drawing;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic; // [수정] List 사용을 위해 추가

public enum MsgType : byte
{
    Value = 0x31,
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
    EquipmentMetric = 0x3D,
}

public class MachineSimulator
{
    private readonly ApiService _apiService;  // Backend Server 통신을 위해 주입 받음
    private readonly TcpClientService _tcpService;  // 장비와 연결하기 위해 주입 받음
    private WorkOrderDto? _currentWorkOrder = null;
    private ProductionLogDto _productionLogDto = new ProductionLogDto();
    private EquipmentMetricUpdateReqDto? _equipmentMetricUpdateReqDto = null;


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

                if (type == (byte)MsgType.Value)
                {
                    short val = BitConverter.ToInt16(payload, 0);
                    // 값을 받아 실행할 부분
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
                                _productionLogDto.DicingDto = DicingDto.FromBytes(payload);
                                Console.WriteLine($"Dicing: {_productionLogDto.DicingDto?.SpindleSpeed}, {_productionLogDto.DicingDto?.FeedRate}");
                                break;

                            case DtoType.DicingInspection:
                                _productionLogDto.DicingInspectionDto = DicingInspectionDto.FromBytes(payload);
                                Console.WriteLine($"DicingInspection: {_productionLogDto.DicingInspectionDto?.OverallPassRatio}");
                                break;

                            case DtoType.DieBonding:
                                _productionLogDto.DieBondingDto = DieBondingDto.FromBytes(payload);
                                Console.WriteLine($"DieBonding: {_productionLogDto.DieBondingDto?.PickUpForce}, {_productionLogDto.DieBondingDto?.CuringTemp}");
                                break;

                            case DtoType.DieBondingInspection:
                                _productionLogDto.DieBondingInspectionDto = DieBondingInspectionDto.FromBytes(payload);
                                Console.WriteLine($"DieBondingInspection: {_productionLogDto.DieBondingInspectionDto?.OverallPassRatio}");
                                break;

                            case DtoType.WireBonding:
                                _productionLogDto.WireBondingDto = WireBondingDto.FromBytes(payload);
                                Console.WriteLine($"WireBonding: {_productionLogDto.WireBondingDto?.BondingTemp}, {_productionLogDto.WireBondingDto?.LoopHeight}");
                                break;

                            case DtoType.WireBondingInspection:
                                _productionLogDto.WireBondingInspectionDto = WireBondingInspectionDto.FromBytes(payload);
                                Console.WriteLine($"WireBondingInspection: {_productionLogDto.WireBondingInspectionDto?.OverallPassRatio}");
                                break;

                            case DtoType.Molding:
                                _productionLogDto.MoldingDto = MoldingDto.FromBytes(payload);
                                Console.WriteLine($"Molding: {_productionLogDto.MoldingDto?.MoldTemp}, {_productionLogDto.MoldingDto?.CureTime}");
                                break;

                            case DtoType.MoldingInspection:
                                _productionLogDto.MoldingInspectionDto = MoldingInspectionDto.FromBytes(payload);
                                Console.WriteLine($"MoldingInspection: {_productionLogDto.MoldingInspectionDto?.OverallPassRatio}");
                                break;

                            case DtoType.EquipmentMetric:
                                _equipmentMetricUpdateReqDto = EquipmentMetricUpdateReqDto.FromBytes(payload);
                                await HandleEquipmentMetric();
                                Console.WriteLine($"EquipmentMetric: {_equipmentMetricUpdateReqDto?.Temperature}");
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
                                    _productionLogDto.ItemDtos?.Add(ItemDto.FromBytes(payload));
                                    Console.WriteLine($"Item: {_productionLogDto.ItemDtos?.Count}");
                                    break;
                                case DtoType.FinalInspection:
                                    _productionLogDto.FinalInspectionDtos?.Add(FinalInspectionDto.FromBytes(payload));
                                    Console.WriteLine($"FinalInspection: {_productionLogDto.FinalInspectionDtos?.Count}");
                                    break;
                                case DtoType.InputLot:
                                    _productionLogDto.InputLots?.Add(System.Text.Encoding.UTF8.GetString(payload, 0, size));
                                    Console.WriteLine($"InputLotSummary: {_productionLogDto.InputLots?.Count}");
                                    break;
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[Deserialize Error] 배열 DTO 변환 실패 : {ex.Message}");
                        }

                        // [수정] 다음 데이터의 사이즈를 읽어옴. (Array 데이터 구조 대응)
                        byte[] nextSizeBuffer = await _tcpService.ReadPacketAsync(2);
                        if (nextSizeBuffer == null || nextSizeBuffer.Length < 2) break;
                        size = BitConverter.ToInt16(nextSizeBuffer, 0);
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
    private async Task HandleEquipmentMetric()
    {
        if (_equipmentMetricUpdateReqDto == null) return;

        // 비동기로 전송 (백그라운드 처리)
        _ = Task.Run(() => _apiService.ReportEquipmentMetricAsync(_equipmentMetricUpdateReqDto));

        if (_equipmentMetricUpdateReqDto.Temperature >= 80)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"⚠️ [과열 경고] {_equipmentMetricUpdateReqDto.Temperature}℃");
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

        // [수정] 서버 엔티티의 Not Null 및 Enum 정합성 세팅
        _productionLogDto.WorkOrderNumber = _currentWorkOrder.WorkOrderNumber;
        _productionLogDto.EquipmentCode = AppConfig.EquipmentCode;
        _productionLogDto.ResultQty = 1;
        _productionLogDto.Status = "DONE";                   // [수정] 서버 ProductionStatus Enum (RUN, DONE, PAUSED) 중 DONE으로 변경
        _productionLogDto.Category = "PRODUCTION";
        _productionLogDto.Level = "INFO";

        // [수정] DateOnly를 사용하여 서버 LocalDate 규격(yyyy-MM-dd)에 맞춤
        _productionLogDto.ResultDate = DateOnly.FromDateTime(DateTime.Today);

        try
        {
            string status = await _apiService.ReportProductionAsync(_productionLogDto);
            Console.WriteLine($"[생산 보고 완료] 결과: {status}, 지시번호: {_productionLogDto.WorkOrderNumber}");

            // 성공 후 초기화
            _currentWorkOrder = null;
            _productionLogDto = new ProductionLogDto();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[생산 보고 실패] 원인: {ex.Message}");
        }
    }

    private async Task SendWorkOrderToDevice(WorkOrderDto order)
    {
        if (order.ProductCode == null)
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine($"[WORN] 작업지시서 오류, 작업취소");
            Console.ResetColor();

            _currentWorkOrder = null;

            return;
        }

        if (!_tcpService.IsConnected) return;

        _currentWorkOrder = order;

        // [수정] 작업 시작 시 기본 정보 세팅
        _productionLogDto.WorkOrderNumber = order.WorkOrderNumber;
        _productionLogDto.EquipmentCode = AppConfig.EquipmentCode;

        byte[] productCodeBody = System.Text.Encoding.UTF8.GetBytes(order.ProductCode);
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