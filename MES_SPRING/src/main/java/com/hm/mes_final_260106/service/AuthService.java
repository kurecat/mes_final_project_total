package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.dto.LoginReqDto;
import com.hm.mes_final_260106.dto.MemberResDto;
import com.hm.mes_final_260106.dto.SignUpReqDto;
import com.hm.mes_final_260106.dto.TokenDto;
import com.hm.mes_final_260106.entity.Member;
import com.hm.mes_final_260106.repository.MemberRepository;
import com.hm.mes_final_260106.repository.LoginLogRepository;
import com.hm.mes_final_260106.entity.LoginLog;
import com.hm.mes_final_260106.security.TokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {
    private final AuthenticationManagerBuilder managerBuilder;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenProvider tokenProvider;
    private final LoginLogRepository loginLogRepo;

    public MemberResDto signup(SignUpReqDto dto) {
        if (memberRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("이미 가입되어 있는 사원입니다");
        }

        // DTO 내부에서 암호화 로직이 처리되도록 설계된 toEntity 사용
        Member member = dto.toEntity(passwordEncoder);
        memberRepository.save(member);
        return MemberResDto.of(memberRepository.save(member));
    }

    // 2. 로그인 (수정됨: 로그 저장 기능 추가)
    // 🚨 readOnly = true를 제거하거나 false로 해야 저장(INSERT)이 됩니다.
    @Transactional
    public TokenDto login(LoginReqDto Dto) {
        UsernamePasswordAuthenticationToken authenticationToken = Dto.toAuthenticationToken();

        // 1. 인증 수행
        Authentication authentication = managerBuilder.getObject().authenticate(authenticationToken);

        // 🚨 [추가] 로그인 성공 로그 저장
        LoginLog log = LoginLog.builder()
                .email(Dto.getEmail())
                .status("SUCCESS")
                .loginTime(LocalDateTime.now())
                .ipAddress("127.0.0.1") // 실제 IP는 Controller에서 받아와야 하지만 편의상 고정
                .build();
        loginLogRepo.save(log);

        // 2. 토큰 생성 및 반환
        return tokenProvider.generateTokenDto(authentication);
    }

    // 🚨 [추가] 로그 조회 메서드 (Controller용)
    @Transactional(readOnly = true)
    public List<LoginLog> getAllLoginLogs() {
        return loginLogRepo.findAllByOrderByLoginTimeDesc();
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