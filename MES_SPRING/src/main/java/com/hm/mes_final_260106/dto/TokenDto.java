package com.hm.mes_final_260106.dto;

import lombok.*;
// 로그인 성공 시 응답으로 클라이언트에 전달

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenDto {
    private String grantType;
    private String accessToken;
    private String refreshToken;
    private Long accessTokenExpiresIn;
    private Long refreshTokenExpiresIn;
}