package com.hm.mes_final_260106.controller;

import com.hm.mes_final_260106.dto.LoginReqDto;
import com.hm.mes_final_260106.dto.MemberResDto;
import com.hm.mes_final_260106.dto.SignUpReqDto;
import com.hm.mes_final_260106.dto.TokenDto;
import com.hm.mes_final_260106.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    private final AuthService authService;

    // 1. 회원가입: SignUpReqDto를 받아 성공 시 MemberResDto(비번 제외 정보) 반환
    @PostMapping("/signup")
    public ResponseEntity<MemberResDto> signup(@RequestBody SignUpReqDto dto) {
        log.info("signup dto {}", dto);
        return ResponseEntity.ok(authService.signup(dto));
    }

    // 2. 로그인: LoginReqDto를 받아 성공 시 TokenDto(JWT) 반환
    @PostMapping("/login")
    public ResponseEntity<TokenDto> login(@RequestBody LoginReqDto dto) {
        log.info("login dto {}", dto);
        return ResponseEntity.ok(authService.login(dto));
    }
}
