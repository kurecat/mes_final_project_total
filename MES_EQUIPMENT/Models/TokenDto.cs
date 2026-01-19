// 백엔드에서 제외
public class TokenDto
{
    public string GrantType { get; set; } = string.Empty;
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public long AccessTokenExpiresIn { get; set; }
}