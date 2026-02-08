package com.hm.mes_final_260106.security;


import com.hm.mes_final_260106.entity.LoginLog;
import com.hm.mes_final_260106.repository.LoginLogRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomAuthenticationFailureHandler implements AuthenticationFailureHandler {

    private final LoginLogRepository loginLogRepository;
    private final ObjectMapper objectMapper; // JSON 응답용

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {

        String email = request.getParameter("email"); // 폼 데이터나 JSON 파싱 필요할 수 있음
        String ip = getClientIp(request);
        String errorMessage = "로그인 실패: " + exception.getMessage();

        log.warn("Login Failed: email={}, reason={}", email, exception.getMessage());

        // ★ [핵심] 실패 로그 DB 저장
        try {
            LoginLog log = LoginLog.builder()
                    .email(email != null ? email : "unknown")
                    .ipAddress(ip)
                    .status("FAIL")
                    .message(errorMessage)
                    .loginTime(LocalDateTime.now())
                    .build();
            loginLogRepository.save(log);
        } catch (Exception e) {
            log.error("Failed to save login fail log", e);
        }

        // 클라이언트에게 JSON 에러 응답 보내기
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
        response.setContentType("application/json;charset=UTF-8");

        Map<String, Object> data = new HashMap<>();
        data.put("success", false);
        data.put("message", "아이디 또는 비밀번호가 일치하지 않습니다.");
        data.put("error", exception.getMessage());

        response.getWriter().write(objectMapper.writeValueAsString(data));
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}