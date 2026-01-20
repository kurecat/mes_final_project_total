package com.hm.mes_final_260106.dto;

import com.hm.mes_final_260106.constant.Authority;
import com.hm.mes_final_260106.entity.Member;
import lombok.*;
import org.springframework.security.crypto.password.PasswordEncoder;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class SignUpReqDto {
    private String email;
    private String password;
    private String name;
    private Authority authority;

    public Member toEntity(PasswordEncoder encoder) {
        return Member.builder()
                .email(email)
                .password(encoder.encode(password))
                .name(name)
                .authority(Authority.valueOf(authority))
                .build();
    }
}
