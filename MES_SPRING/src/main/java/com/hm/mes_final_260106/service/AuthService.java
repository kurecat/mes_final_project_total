// [수정 이유] 토큰 재발급(reissue), 로그아웃(deleteRefreshToken), 승인(approveMember) 로직 추가

package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.constant.MemberStatus;
import com.hm.mes_final_260106.dto.*;
import com.hm.mes_final_260106.entity.Member;
import com.hm.mes_final_260106.entity.RefreshToken;
import com.hm.mes_final_260106.exception.CustomException;
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

    // 1. 회원가입
    public MemberResDto signup(SignUpReqDto dto) {
        if (memberRepository.existsByEmail(dto.getEmail())) {
            throw new CustomException("이미 가입되어 있는 사원입니다");
        }

        Member member = dto.toEntity(passwordEncoder);
        return MemberResDto.of(memberRepository.save(member));
    }

    // 2. 로그인
    @Transactional
    public GlobalResponseDto<TokenDto> login(LoginReqDto dto) {
        // [긴급 진단] 리액트가 쏜 데이터가 진짜 뭔지 소환
        System.out.println("🔥 [DEBUG] 리액트가 보낸 이메일: [" + dto.getEmail() + "]");

        // DB에 있는 전체 유저 수 카운트 (DB 연결 확인용)
        long count = memberRepository.count();
        System.out.println("🔥 [DEBUG] 현재 DB에 저장된 총 회원 수: " + count);

        UsernamePasswordAuthenticationToken authenticationToken = dto.toAuthenticationToken();
        Authentication authentication = managerBuilder.getObject().authenticate(authenticationToken);

        //  PENDING 유저 차단
        Member member = memberRepository.findById(Long.parseLong(authentication.getName())) // 숫자로 바꾼 후 ID로 조회
                .orElseThrow(() -> new CustomException("회원을 찾을 수 없습니다."));

        if (member.getStatus() == MemberStatus.PENDING) {
            throw new CustomException("관리자 승인 대기 중입니다.");
        }

        //  JWT 생성 (TokenProvider 내부에서 RefreshToken DB 저장)
        TokenDto tokenDto = tokenProvider.generateTokenDto(authentication);
        return GlobalResponseDto.success("로그인 성공", tokenDto);
    }

    // 3.  토큰 재발급 (C#과 React가 호출)
    @Transactional
    public GlobalResponseDto<TokenDto> reissue(TokenRequestDto dto) {
        // 1) RefreshToken 검증
        if (!tokenProvider.validateToken(dto.getRefreshToken())) {
            throw new CustomException("유효하지 않은 Refresh Token입니다.");
        }

        // 2) AccessToken에서 memberId 추출 (만료되어도 파싱 가능)
        Long memberId = tokenProvider.getMemberIdFromToken(dto.getAccessToken());

        // 3) DB의 RefreshToken과 비교
        RefreshToken refreshToken = refreshTokenRepository.findByMemberId(memberId)
                .orElseThrow(() -> new CustomException("로그아웃된 사용자입니다."));

        if (!refreshToken.getToken().equals(dto.getRefreshToken())) {
            throw new CustomException("Refresh Token이 일치하지 않습니다.");
        }

        // 4) 새로운 토큰 생성 - ★ 수정된 부분
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException("회원을 찾을 수 없습니다."));

        // ★ authenticate 한 번만 호출
        Authentication authentication = managerBuilder.getObject().authenticate(
                new UsernamePasswordAuthenticationToken(member.getEmail(), member.getPassword())
        );

        TokenDto newTokenDto = tokenProvider.generateTokenDto(authentication);

        log.info("토큰 재발급 성공 - memberId: {}", memberId);
        return GlobalResponseDto.success("토큰 재발급 성공", newTokenDto);
    }

    // 4.  로그아웃 (RefreshToken 삭제)
    @Transactional
    public void deleteRefreshToken(Long memberId) {
        refreshTokenRepository.deleteByMemberId(memberId);
        log.info("로그아웃 완료 - memberId: {}", memberId);
    }

    // 5.  관리자 승인 (PENDING → ACTIVE)
    @Transactional
    public GlobalResponseDto<MemberResDto> approveMember(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new CustomException("회원을 찾을 수 없습니다."));

        if (member.getStatus() != MemberStatus.PENDING) {
            throw new CustomException("승인 대기 중인 회원이 아닙니다.");
        }

        member.setStatus(MemberStatus.ACTIVE);
        memberRepository.save(member);

        log.info("회원 승인 완료 - memberId: {}, email: {}", memberId, member.getEmail());
        return GlobalResponseDto.success("회원 승인 완료", MemberResDto.of(member));
    }
    // 6. 전체 회원 목록 조회 (관리자용)
    @Transactional(readOnly = true)
    public GlobalResponseDto<List<MemberResDto>> findAll() {
        List<Member> members = memberRepository.findAll();
        List<MemberResDto> list = members.stream()
                .map(MemberResDto::of)
                .collect(Collectors.toList());

        log.info("전체 회원 목록 조회 완료 - 총 {}명", list.size());
        return GlobalResponseDto.success("조회 성공", list);
    }


//111
}