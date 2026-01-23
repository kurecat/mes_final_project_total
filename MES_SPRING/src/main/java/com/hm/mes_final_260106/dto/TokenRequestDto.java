// [신규 생성] 토큰 재발급 요청 DTO
// C#과 React에서 /auth/refresh 호출 시 사용

package com.hm.mes_final_260106.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenRequestDto {
    private String accessToken;
    private String refreshToken;
}
///1111111111