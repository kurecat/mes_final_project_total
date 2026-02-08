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
// 클래스 레벨의 @Transactional은 유지하되, login 메서드에서 예외 발생 시 로그 롤백을 막기 위해 주의해야 합니다.
@Transactional
public class AuthService {
    private final AuthenticationManagerBuilder managerBuilder;
    private final MemberRepository memberRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenProvider tokenProvider;

    // ★ LoginLogRepository 직접 사용 (SystemLogService 제거)
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

    // ★ [핵심] 로그인 로그 저장 메서드
    // 로그는 비즈니스 로직 실패와 상관없이 무조건 저장되어야 하므로 별도 트랜잭션 처리 권장
    // 하지만 간단하게 구현하기 위해 여기서는 login 메서드 내에서 호출합니다.
    private void saveLoginLog(String email, String status, String message) {
        try {
            LoginLog log = LoginLog.builder()
                    .email(email)
                    .ipAddress(getClientIp())
                    .status(status)   // "SUCCESS" or "FAIL"
                    .message(message) // 상세 사유
                    .build(); // @PrePersist 덕분에 loginTime은 자동 설정됨
            loginLogRepository.save(log);
        } catch (Exception e) {
            log.error("로그 저장 실패", e);
        }
    }

    // 1. 회원가입
    public MemberResDto signup(SignUpReqDto dto) {
        if (memberRepository.existsByEmail(dto.getEmail())) {
            throw new CustomException("이미 가입되어 있는 사원입니다");
        }
        Member member = dto.toEntity(passwordEncoder);
        return MemberResDto.of(memberRepository.save(member));
    }

    // 2. 로그인 (수정됨)
    // ★ noRollbackFor 설정: 예외가 터져도 로그 저장(INSERT) 내역을 롤백하지 않음
    @Transactional(noRollbackFor = {CustomException.class, Exception.class})
    public GlobalResponseDto<TokenDto> login(LoginReqDto dto) {
        log.info("Login attempt for email: {}", dto.getEmail());

        // 1. ID/PW 인증 시도
        Authentication authentication;
        try {
            UsernamePasswordAuthenticationToken authenticationToken = dto.toAuthenticationToken();
            authentication = managerBuilder.getObject().authenticate(authenticationToken);
        } catch (Exception e) {
            // ★ [로그 저장] 비밀번호 불일치 실패
            saveLoginLog(dto.getEmail(), "FAIL", "비밀번호 불일치 또는 계정 없음");
            throw new CustomException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }

        // 2. 회원 정보 조회
        Member member = memberRepository.findById(Long.parseLong(authentication.getName()))
                .orElseThrow(() -> new CustomException("회원을 찾을 수 없습니다."));

        // 3. 승인 대기 확인
        if (member.getStatus() == MemberStatus.PENDING) {
            // ★ [로그 저장] 승인 대기 실패
            saveLoginLog(member.getEmail(), "FAIL", "관리자 승인 대기 중");
            throw new CustomException("관리자 승인 대기 중입니다.");
        }

        // 4. 현장 작업자 접근 차단
        if (member.getAuthority() == Authority.ROLE_OPERATOR) {
            // ★ [로그 저장] 권한 없음 실패
            saveLoginLog(member.getEmail(), "FAIL", "웹 접근 권한 없음 (Operator)");
            throw new CustomException("현장 작업자는 웹 시스템에 접근할 수 없습니다.");
        }

        // 5. 토큰 발급
        TokenDto tokenDto = tokenProvider.generateTokenDto(authentication);
        tokenDto.setMemberInfo(MemberResDto.of(member));

        // 6. [로그 저장] 로그인 성공
        saveLoginLog(member.getEmail(), "SUCCESS", "로그인 성공");

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

    // 7. 회원 수정
    @Transactional
    public MemberResDto updateMember(Long id, SignUpReqDto dto) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));

        member.setName(dto.getName());
        member.setDepartment(dto.getDepartment());
        member.setPhone(dto.getPhone());

        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            member.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        if (dto.getRole() != null && !dto.getRole().isEmpty()) {
            try {
                member.setAuthority(Authority.valueOf(dto.getRole()));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid Role format: {}", dto.getRole());
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