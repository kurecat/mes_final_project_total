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
@CrossOrigin(origins = "*", allowedHeaders = "*")
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

    // 6. 회원 정보 수정 - 프론트: api.put("/auth/update/{memberId}")
    // ★ 새로 추가된 부분
    @PutMapping("/update/{memberId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<GlobalResponseDto<MemberResDto>> updateMember(@PathVariable Long memberId, @RequestBody SignUpReqDto dto) {
        log.info("회원 정보 수정 요청 - ID: {}", memberId);
        // AuthService에 updateMember 메소드를 만들어야 합니다. (아래 참고)
        return ResponseEntity.ok(GlobalResponseDto.success("회원 수정 성공", authService.updateMember(memberId, dto)));
    }

    // 7. 회원 삭제 - 프론트: api.delete("/auth/delete/{memberId}")
    // ★ 새로 추가된 부분
    @DeleteMapping("/delete/{memberId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<GlobalResponseDto<String>> deleteMember(@PathVariable Long memberId) {
        log.info("회원 삭제 요청 - ID: {}", memberId);
        authService.deleteMember(memberId);
        return ResponseEntity.ok(GlobalResponseDto.success("회원 삭제 성공", "Deleted ID: " + memberId));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<GlobalResponseDto<List<MemberResDto>>> getAllMembers() {
        return ResponseEntity.ok(authService.findAll());
    }
}