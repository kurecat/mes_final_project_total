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

    // 2. 로그인 (여기에 로그 저장 로직 추가함)
    @Transactional
    public GlobalResponseDto<TokenDto> login(LoginReqDto dto) {
        // [DEBUG] 리액트가 쏜 데이터 확인
        System.out.println("🔥 [DEBUG] 로그인 시도 이메일: [" + dto.getEmail() + "]");

        UsernamePasswordAuthenticationToken authenticationToken = dto.toAuthenticationToken();
        Authentication authentication = managerBuilder.getObject().authenticate(authenticationToken);

        // PENDING 유저 차단
        Member member = memberRepository.findById(Long.parseLong(authentication.getName()))
                .orElseThrow(() -> new CustomException("회원을 찾을 수 없습니다."));

        if (member.getStatus() == MemberStatus.PENDING) {
            // 실패 로그도 남기고 싶으면 여기서 catch해서 save 하면 되는데, 일단 성공 로그만!
            throw new CustomException("관리자 승인 대기 중입니다.");
        }

        // JWT 생성
        TokenDto tokenDto = tokenProvider.generateTokenDto(authentication);

        // ★★★ [여기 추가] DB에 로그인 기록 저장 (이게 없어서 안 떴던 거임) ★★★
        LoginLog log = LoginLog.builder()
                .email(member.getEmail())
                .ipAddress("127.0.0.1") // 실제 IP는 Controller에서 받아와야 하지만 일단 로컬이니까 이걸로 퉁
                .status("SUCCESS")
                .loginTime(LocalDateTime.now())
                .build();

        loginLogRepository.save(log);
        System.out.println("✅ [LOG] 로그인 로그 저장 완료: " + member.getEmail());
        // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

        return GlobalResponseDto.success("로그인 성공", tokenDto);
    }


    // 3. 토큰 재발급
    @Transactional
    public GlobalResponseDto<TokenDto> reissue(TokenRequestDto dto) {
        // 1) RefreshToken 검증
        if (!tokenProvider.validateToken(dto.getRefreshToken())) {
            throw new CustomException("유효하지 않은 Refresh Token입니다.");
        }

        // 2) AccessToken에서 memberId 추출
        Long memberId = tokenProvider.getMemberIdFromToken(dto.getAccessToken());

        // 3) DB의 RefreshToken과 비교
        RefreshToken refreshToken = refreshTokenRepository.findByMemberId(memberId)
                .orElseThrow(() -> new CustomException("로그아웃된 사용자입니다."));

        if (!refreshToken.getToken().equals(dto.getRefreshToken())) {
            throw new CustomException("Refresh Token이 일치하지 않습니다.");
        }

        // 4) 새로운 토큰 생성
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException("회원을 찾을 수 없습니다."));

        Authentication authentication = managerBuilder.getObject().authenticate(
                new UsernamePasswordAuthenticationToken(member.getEmail(), member.getPassword())
        );

        TokenDto newTokenDto = tokenProvider.generateTokenDto(authentication);

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