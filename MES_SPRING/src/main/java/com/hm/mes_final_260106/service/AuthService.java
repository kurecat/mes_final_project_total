package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.constant.MemberStatus;
import com.hm.mes_final_260106.dto.*;
import com.hm.mes_final_260106.entity.LoginLog; // ★ 추가됨
import com.hm.mes_final_260106.entity.Member;
import com.hm.mes_final_260106.entity.RefreshToken;
import com.hm.mes_final_260106.exception.CustomException;
import com.hm.mes_final_260106.repository.LoginLogRepository; // ★ 추가됨
import com.hm.mes_final_260106.repository.MemberRepository;
import com.hm.mes_final_260106.repository.RefreshTokenRepository;
import com.hm.mes_final_260106.security.TokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime; // ★ 추가됨
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

    // ★ [핵심] 로그 저장을 위한 레포지토리 추가
    private final LoginLogRepository loginLogRepository;

    // 1. 회원가입
    public MemberResDto signup(SignUpReqDto dto) {
        if (memberRepository.existsByEmail(dto.getEmail())) {
            throw new CustomException("이미 가입되어 있는 사원입니다");
        }

        Member member = dto.toEntity(passwordEncoder);
        return MemberResDto.of(memberRepository.save(member));
    }

    // 2. 로그인 (로그 저장 + 유저 정보 포함 리턴)
    @Transactional
    public GlobalResponseDto<TokenDto> login(LoginReqDto dto) {
        System.out.println("🔥 [DEBUG] 로그인 시도 이메일: [" + dto.getEmail() + "]");

        UsernamePasswordAuthenticationToken authenticationToken = dto.toAuthenticationToken();
        Authentication authentication = managerBuilder.getObject().authenticate(authenticationToken);

        Member member = memberRepository.findById(Long.parseLong(authentication.getName()))
                .orElseThrow(() -> new CustomException("회원을 찾을 수 없습니다."));

        if (member.getStatus() == MemberStatus.PENDING) {
            throw new CustomException("관리자 승인 대기 중입니다.");
        }

        // JWT 생성
        TokenDto tokenDto = tokenProvider.generateTokenDto(authentication);

        // ★★★ [추가] TokenDto에 유저 정보 담기 ★★★
        tokenDto.setMemberInfo(MemberResDto.of(member));

        // DB에 로그인 기록 저장
        LoginLog logRecord = LoginLog.builder()
                .email(member.getEmail())
                .ipAddress("127.0.0.1")
                .status("SUCCESS")
                .loginTime(LocalDateTime.now())
                .build();

        loginLogRepository.save(logRecord);
        System.out.println("✅ [LOG] 로그인 로그 저장 완료: " + member.getEmail());

        return GlobalResponseDto.success("로그인 성공", tokenDto);
    }


    // 3. 토큰 재발급 (여기에도 유저 정보 추가)
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

        // 토큰 재발급을 위한 권한 정보 생성
        Authentication authentication = tokenProvider.getAuthentication(dto.getAccessToken());

        TokenDto newTokenDto = tokenProvider.generateTokenDto(authentication);

        // ★★★ [추가] 재발급 시에도 유저 정보를 같이 줘야 리액트가 유지됨 ★★★
        newTokenDto.setMemberInfo(MemberResDto.of(member));

        log.info("토큰 재발급 성공 - memberId: {}", memberId);
        return GlobalResponseDto.success("토큰 재발급 성공", newTokenDto);
    }

    // 4. 로그아웃
    @Transactional
    public void deleteRefreshToken(Long memberId) {
        refreshTokenRepository.deleteByMemberId(memberId);
        log.info("로그아웃 완료 - memberId: {}", memberId);
    }

    // 5. 관리자 승인
    // AuthService.java

    @Transactional
    public GlobalResponseDto<MemberResDto> approveMember(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException("회원을 찾을 수 없습니다."));

        // ★ [기존 코드 주의] if (member.getStatus() != MemberStatus.PENDING) ... 이런 줄 있으면 삭제!!

        String msg;
        if (member.getStatus() == MemberStatus.PENDING) {
            // 현재 대기 중이면 승인으로
            member.setStatus(MemberStatus.ACTIVE);
            msg = "회원 승인 완료";
        } else {
            // ★ 핵심: 이미 ACTIVE면 다시 PENDING으로 (승인 취소 기능)
            member.setStatus(MemberStatus.PENDING);
            msg = "회원 승인 취소 (대기 전환)";
        }

        log.info("회원 상태 변경: {} -> {}", member.getEmail(), member.getStatus());

        return GlobalResponseDto.success(msg, MemberResDto.of(member));
    }

    // 6. 전체 회원 목록 조회
    @Transactional(readOnly = true)
    public GlobalResponseDto<List<MemberResDto>> findAll() {
        List<Member> members = memberRepository.findAll();
        List<MemberResDto> list = members.stream()
                .map(MemberResDto::of)
                .collect(Collectors.toList());

        log.info("전체 회원 목록 조회 완료 - 총 {}명", list.size());
        return GlobalResponseDto.success("조회 성공", list);
    }
}