package com.hm.mes_final_260106.dto;

import com.hm.mes_final_260106.constant.Authority;
import com.hm.mes_final_260106.constant.MemberStatus;
import com.hm.mes_final_260106.entity.Member;
import lombok.*;
import org.springframework.security.crypto.password.PasswordEncoder;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class SignUpReqDto {
    private String email;
    private String password;
    private String name;
    private String department;
    private String phone;

    // ★ 프론트엔드에서 "role": "ROLE_ADMIN" 형태로 보내므로 String으로 받음
    private String role;

    public Member toEntity(PasswordEncoder encoder) {
        // role 값이 없으면 기본값 ROLE_OPERATOR 사용
        Authority auth = (role != null && !role.isEmpty())
                ? Authority.valueOf(role)
                : Authority.ROLE_OPERATOR;

        return Member.builder()
                .email(email)
                .password(encoder.encode(password))
                .name(name)
                .authority(auth) // 변환된 Enum 사용
                .department(department)
                .phone(phone)
                .status(MemberStatus.PENDING) // 기본 상태는 승인 대기
                .build();
    }
}