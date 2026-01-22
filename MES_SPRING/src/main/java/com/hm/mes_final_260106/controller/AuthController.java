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
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<GlobalResponseDto<MemberResDto>> signup(@RequestBody SignUpReqDto dto) {
        return ResponseEntity.ok(GlobalResponseDto.success("회원가입 성공", authService.signup(dto)));
    }

    @PostMapping("/login")
    public ResponseEntity<GlobalResponseDto<TokenDto>> login(@RequestBody LoginReqDto dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    @PostMapping("/refresh")
    public ResponseEntity<GlobalResponseDto<TokenDto>> refresh(@RequestBody TokenRequestDto dto) {
        return ResponseEntity.ok(authService.reissue(dto));
    }

    @PostMapping("/logout")
    public ResponseEntity<GlobalResponseDto<?>> logout() {
        authService.deleteRefreshToken(SecurityUtil.getCurrentMemberId());
        return ResponseEntity.ok(GlobalResponseDto.success("로그아웃 성공", Collections.emptyMap()));
    }

    // ★ 수정: hasAuthority("ROLE_ADMIN") 사용
    @PutMapping("/approve/{memberId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<GlobalResponseDto<MemberResDto>> approveMember(@PathVariable Long memberId) {
        log.info("승인 요청 - Target ID: {}", memberId);
        return ResponseEntity.ok(authService.approveMember(memberId));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<GlobalResponseDto<List<MemberResDto>>> getAllMembers() {
        return ResponseEntity.ok(authService.findAll());
    }
}