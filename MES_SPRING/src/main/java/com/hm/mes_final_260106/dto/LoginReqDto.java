package com.hm.mes_final_260106.dto;

import lombok.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class LoginReqDto {
    private String email;
    private String password;
    private String name;

    // Spring Security 인증을 위한 토큰 생성
    public UsernamePasswordAuthenticationToken toAuthenticationToken() {
        return new UsernamePasswordAuthenticationToken(email, password);
    }
}