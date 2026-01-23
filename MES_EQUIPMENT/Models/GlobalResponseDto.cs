public class GlobalResponseDto<T>
{
    public bool success { get; set; } = false;
    public string message { get; set; } = string.Empty;
    public T? data { get; set; }
}