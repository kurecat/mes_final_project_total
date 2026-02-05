package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.constant.Authority;
import com.hm.mes_final_260106.constant.MemberStatus;
import com.hm.mes_final_260106.dto.*;
import com.hm.mes_final_260106.entity.LoginLog;
import com.hm.mes_final_260106.entity.Member;
import com.hm.mes_final_260106.entity.RefreshToken;
import com.hm.mes_final_260106.exception.CustomException;
import com.hm.mes_final_260106.repository.LoginLogRepository;
import com.hm.mes_final_260106.repository.MemberRepository;
import com.hm.mes_final_260106.repository.RefreshTokenRepository;
import com.hm.mes_final_260106.security.TokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {
    private final AuthenticationManagerBuilder managerBuilder;
    private final MemberRepository memberRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenProvider tokenProvider;
    private final LoginLogRepository loginLogRepository;

    // 클라이언트 IP 추출 헬퍼 메서드
    private String getClientIp() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String ip = request.getHeader("X-Forwarded-For");
                if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getRemoteAddr();
                }
                return ip;
            }
        } catch (Exception e) {
            log.error("Failed to get client IP", e);
        }
        return "Unknown";
    }

    // 1. 회원가입
    public MemberResDto signup(SignUpReqDto dto) {
        if (memberRepository.existsByEmail(dto.getEmail())) {
            throw new CustomException("이미 가입되어 있는 사원입니다");
        }
        // DTO의 toEntity 메서드 내에서 role 문자열을 Authority Enum으로 변환 처리함
        Member member = dto.toEntity(passwordEncoder);
        return MemberResDto.of(memberRepository.save(member));
    }

    // 2. 로그인
    @Transactional
    public GlobalResponseDto<TokenDto> login(LoginReqDto dto) {
        log.info("Login attempt for email: {}", dto.getEmail());

        UsernamePasswordAuthenticationToken authenticationToken = dto.toAuthenticationToken();
        Authentication authentication = managerBuilder.getObject().authenticate(authenticationToken);

        Member member = memberRepository.findById(Long.parseLong(authentication.getName()))
                .orElseThrow(() -> new CustomException("회원을 찾을 수 없습니다."));

        if (member.getStatus() == MemberStatus.PENDING) {
            throw new CustomException("관리자 승인 대기 중입니다.");
        }

        TokenDto tokenDto = tokenProvider.generateTokenDto(authentication);
        tokenDto.setMemberInfo(MemberResDto.of(member));

        // 로그인 로그 저장
        LoginLog logRecord = LoginLog.builder()
                .email(member.getEmail())
                .ipAddress(getClientIp())
                .status("SUCCESS")
                .loginTime(LocalDateTime.now())
                .build();

        loginLogRepository.save(logRecord);

        return GlobalResponseDto.success("로그인 성공", tokenDto);
    }

    // 3. 토큰 재발급
    @Transactional
    public GlobalResponseDto<TokenDto> reissue(TokenRequestDto dto) {
        if (!tokenProvider.validateToken(dto.getRefreshToken())) {
            throw new CustomException("유효하지 않은 Refresh Token입니다.");
        }

        Long memberId = tokenProvider.getMemberIdFromToken(dto.getAccessToken());
        RefreshToken refreshToken = refreshTokenRepository.findByMemberId(memberId)
                .orElseThrow(() -> new CustomException("로그아웃된 사용자입니다."));

        if (!refreshToken.getToken().equals(dto.getRefreshToken())) {
            throw new CustomException("Refresh Token이 일치하지 않습니다.");
        }

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException("회원을 찾을 수 없습니다."));

        Authentication authentication = tokenProvider.getAuthentication(dto.getAccessToken());
        TokenDto newTokenDto = tokenProvider.generateTokenDto(authentication);
        newTokenDto.setMemberInfo(MemberResDto.of(member));

        return GlobalResponseDto.success("토큰 재발급 성공", newTokenDto);
    }

    // 4. 로그아웃
    @Transactional
    public void deleteRefreshToken(Long memberId) {
        refreshTokenRepository.deleteByMemberId(memberId);
    }

    // 5. 관리자 승인
    @Transactional
    public GlobalResponseDto<MemberResDto> approveMember(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException("회원을 찾을 수 없습니다."));

        String msg;
        if (member.getStatus() == MemberStatus.PENDING) {
            member.setStatus(MemberStatus.ACTIVE);
            msg = "회원 승인 완료";
        } else {
            member.setStatus(MemberStatus.PENDING);
            msg = "회원 승인 취소 (대기 전환)";
        }
        return GlobalResponseDto.success(msg, MemberResDto.of(member));
    }

    // 6. 전체 회원 목록 조회
    @Transactional(readOnly = true)
    public GlobalResponseDto<List<MemberResDto>> findAll() {
        List<Member> members = memberRepository.findAll();
        List<MemberResDto> list = members.stream()
                .map(MemberResDto::of)
                .collect(Collectors.toList());
        return GlobalResponseDto.success("조회 성공", list);
    }

    // ★ 7. 회원 수정 (권한 변경 로직 포함)
    @Transactional
    public MemberResDto updateMember(Long id, SignUpReqDto dto) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));

        member.setName(dto.getName());
        member.setDepartment(dto.getDepartment());
        member.setPhone(dto.getPhone());

        // 비밀번호가 입력된 경우에만 변경
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            member.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        // ★ 권한 변경 로직 추가
        if (dto.getRole() != null && !dto.getRole().isEmpty()) {
            try {
                member.setAuthority(Authority.valueOf(dto.getRole()));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid Role format: {}", dto.getRole());
                // 필요시 예외 발생 또는 무시
            }
        }

        return MemberResDto.of(memberRepository.save(member));
    }

    // 8. 회원 삭제
    @Transactional
    public void deleteMember(Long id) {
        memberRepository.deleteById(id);
    }
}