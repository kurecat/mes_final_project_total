package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.dto.LoginReqDto;
import com.hm.mes_final_260106.dto.MemberResDto;
import com.hm.mes_final_260106.dto.SignUpReqDto;
import com.hm.mes_final_260106.dto.TokenDto;
import com.hm.mes_final_260106.entity.Member;
import com.hm.mes_final_260106.repository.MemberRepository;
import com.hm.mes_final_260106.security.TokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {
    private final AuthenticationManagerBuilder managerBuilder;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenProvider tokenProvider;

    public MemberResDto signup(SignUpReqDto dto) {
        if (memberRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("이미 가입되어 있는 사원입니다");
        }

        // DTO 내부에서 암호화 로직이 처리되도록 설계된 toEntity 사용
        Member member = dto.toEntity(passwordEncoder);
        memberRepository.save(member);
        return MemberResDto.of(memberRepository.save(member));
    }

    // 2. 로그인 (LoginReqDto 사용)
    @Transactional(readOnly = true) // 로그인 시에는 DB 변경이 없으므로 성능 최적화
    public TokenDto login(LoginReqDto Dto) {
        // [수정] 메서드 명칭을 DTO에 정의한 toAuthenticationToken()으로 일치시킴
        UsernamePasswordAuthenticationToken authenticationToken = Dto.toAuthenticationToken();

        // [핵심 로직]
        // 1. authenticate() 메서드가 실행될 때 우리가 만든 CustomUserDetailsService의 loadUserByUsername이 실행됨
        // 2. DB 정보와 사용자 입력 정보를 비교하여 인증 수행
        Authentication authentication = managerBuilder.getObject().authenticate(authenticationToken);

        // 3. 인증 정보를 기반으로 JWT 토큰(AccessToken, RefreshToken 등) 생성
        return tokenProvider.generateTokenDto(authentication);
    }

    // 3. accessToken 재발급 (추후 구현 시 참고용 로직)
    /* public TokenDto reissue(TokenRequestDto tokenRequestDto) {
        // 1. Refresh Token 검증
        // 2. Access Token에서 Member ID 가져오기
        // 3. 저장소의 Refresh Token과 비교
        // 4. 새로운 토큰 생성 및 리턴
    }
    */
}