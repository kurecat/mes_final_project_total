package com.hm.mes_final_260106.controller;

import com.hm.mes_final_260106.dto.LoginReqDto;
import com.hm.mes_final_260106.dto.GlobalResponseDto; // GlobalResponseDto import 추가
import com.hm.mes_final_260106.dto.LoginReqDto;
import com.hm.mes_final_260106.dto.MemberResDto;
import com.hm.mes_final_260106.dto.SignUpReqDto;
import com.hm.mes_final_260106.dto.TokenDto;
import com.hm.mes_final_260106.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections; // Collections import 추가

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    private final AuthService authService;

    // 1. 회원가입: SignUpReqDto를 받아 성공 시 MemberResDto(비번 제외 정보)를 GlobalResponseDto로 감싸 반환
    @PostMapping("/signup")
    public ResponseEntity<GlobalResponseDto<MemberResDto>> signup(@RequestBody SignUpReqDto dto) { // 리액트 연동을 위해 JSON 포맷 통일함
        log.info("signup dto {}", dto);
        MemberResDto memberResDto = authService.signup(dto);
        return ResponseEntity.ok(GlobalResponseDto.success("회원가입 성공. 관리자 승인 대기 중.", memberResDto));
    }

    // 2. 로그인: LoginReqDto를 받아 성공 시 TokenDto(JWT)를 GlobalResponseDto로 감싸 반환
    @PostMapping("/login")
    public ResponseEntity<GlobalResponseDto<TokenDto>> login(@RequestBody LoginReqDto dto) { // 리액트 연동을 위해 JSON 포맷 통일함
        log.info("login dto {}", dto);
        return ResponseEntity.ok(authService.login(dto));
    }

    // 3. 로그아웃: RefreshToken 삭제 (추후 구현 시 참고용 로직)
    @PostMapping("/logout")
    public ResponseEntity<GlobalResponseDto<?>> logout() {
        // TODO: Refresh Token 삭제 로직 구현 (DB 또는 Redis 등에서 관리)
        return ResponseEntity.ok(GlobalResponseDto.success("로그아웃 성공", Collections.emptyMap())); // 리액트 연동을 위해 JSON 포맷 통일함
    }
}
