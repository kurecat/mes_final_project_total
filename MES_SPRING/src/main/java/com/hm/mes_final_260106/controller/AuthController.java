// [수정 이유] /auth/refresh, /auth/logout, /auth/approve 엔드포인트 추가

package com.hm.mes_final_260106.controller;

import com.hm.mes_final_260106.dto.*;
import com.hm.mes_final_260106.security.SecurityUtil;
import com.hm.mes_final_260106.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    private final AuthService authService;

    // 1. 회원가입
    @PostMapping("/signup")
    public ResponseEntity<GlobalResponseDto<MemberResDto>> signup(@RequestBody SignUpReqDto dto) {
        log.info("signup dto {}", dto);
        MemberResDto memberResDto = authService.signup(dto);
        return ResponseEntity.ok(GlobalResponseDto.success("회원가입 성공. 관리자 승인 대기 중.", memberResDto));
    }

    // 2. 로그인
    @PostMapping("/login")
    public ResponseEntity<GlobalResponseDto<TokenDto>> login(@RequestBody LoginReqDto dto) {
        log.info("login dto {}", dto);
        return ResponseEntity.ok(authService.login(dto));
    }

    // 3.  토큰 재발급 (C#과 React가 호출)
    @PostMapping("/refresh")
    public ResponseEntity<GlobalResponseDto<TokenDto>> refresh(@RequestBody TokenRequestDto dto) {
        log.info("토큰 재발급 요청 - accessToken: {}...", dto.getAccessToken().substring(0, 20));
        return ResponseEntity.ok(authService.reissue(dto));
    }

    // 4.  로그아웃
    @PostMapping("/logout")
    public ResponseEntity<GlobalResponseDto<?>> logout() {
        Long memberId = SecurityUtil.getCurrentMemberId();
        authService.deleteRefreshToken(memberId);
        return ResponseEntity.ok(GlobalResponseDto.success("로그아웃 성공", Collections.emptyMap()));
    }

    // 5.  관리자 승인 (ADMIN만 가능)
    @PutMapping("/approve/{memberId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GlobalResponseDto<MemberResDto>> approveMember(@PathVariable Long memberId) {
        log.info("회원 승인 요청 - memberId: {}", memberId);
        return ResponseEntity.ok(authService.approveMember(memberId));
    }
}