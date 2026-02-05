package com.hm.mes_final_260106.service;

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
import jakarta.servlet.http.HttpServletRequest; // Added for request context
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

    // Helper method to get client IP
    private String getClientIp() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String ip = request.getHeader("X-Forwarded-For");
                if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getHeader("Proxy-Client-IP");
                }
                if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getHeader("WL-Proxy-Client-IP");
                }
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

    public MemberResDto signup(SignUpReqDto dto) {
        if (memberRepository.existsByEmail(dto.getEmail())) {
            throw new CustomException("이미 가입되어 있는 사원입니다");
        }

        Member member = dto.toEntity(passwordEncoder);
        return MemberResDto.of(memberRepository.save(member));
    }

    @Transactional
    public GlobalResponseDto<TokenDto> login(LoginReqDto dto) {
        log.info("Login attempt for email: {}", dto.getEmail()); // Changed to logger

        UsernamePasswordAuthenticationToken authenticationToken = dto.toAuthenticationToken();
        Authentication authentication = managerBuilder.getObject().authenticate(authenticationToken);

        Member member = memberRepository.findById(Long.parseLong(authentication.getName()))
                .orElseThrow(() -> new CustomException("회원을 찾을 수 없습니다."));

        if (member.getStatus() == MemberStatus.PENDING) {
            throw new CustomException("관리자 승인 대기 중입니다.");
        }

        TokenDto tokenDto = tokenProvider.generateTokenDto(authentication);
        tokenDto.setMemberInfo(MemberResDto.of(member));

        // Use dynamic IP retrieval
        String clientIp = getClientIp();

        LoginLog logRecord = LoginLog.builder()
                .email(member.getEmail())
                .ipAddress(clientIp) // Use actual IP
                .status("SUCCESS")
                .loginTime(LocalDateTime.now())
                .build();

        loginLogRepository.save(logRecord);
        log.info("Login log saved for: {}", member.getEmail());

        return GlobalResponseDto.success("로그인 성공", tokenDto);
    }

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

        log.info("토큰 재발급 성공 - memberId: {}", memberId);
        return GlobalResponseDto.success("토큰 재발급 성공", newTokenDto);
    }

    @Transactional
    public void deleteRefreshToken(Long memberId) {
        refreshTokenRepository.deleteByMemberId(memberId);
        log.info("로그아웃 완료 - memberId: {}", memberId);
    }

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

        log.info("회원 상태 변경: {} -> {}", member.getEmail(), member.getStatus());
        return GlobalResponseDto.success(msg, MemberResDto.of(member));
    }

    @Transactional(readOnly = true)
    public GlobalResponseDto<List<MemberResDto>> findAll() {
        List<Member> members = memberRepository.findAll();
        List<MemberResDto> list = members.stream()
                .map(MemberResDto::of)
                .collect(Collectors.toList());

        log.info("전체 회원 목록 조회 완료 - 총 {}명", list.size());
        return GlobalResponseDto.success("조회 성공", list);
    }

    @Transactional
    public MemberResDto updateMember(Long id, SignUpReqDto dto) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));

        member.setName(dto.getName());
        member.setDepartment(dto.getDepartment());
        member.setPhone(dto.getPhone());
        // Removed direct password set to avoid setting plain text password if encoding fails or is skipped improperly.
        // member.setPassword(dto.getPassword()); // This line was risky if getPassword() returned plain text.

        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            member.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        return MemberResDto.of(memberRepository.save(member));
    }

    @Transactional
    public void deleteMember(Long id) {
        memberRepository.deleteById(id);
    }
}