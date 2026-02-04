public class GlobalResponseDto<T>
{
    public bool Success { get; set; }   // Java의 boolean → C# bool
    public string Message { get; set; } // 문자열 메시지
    public T Data { get; set; }         // 제네릭 타입 데이터
}
