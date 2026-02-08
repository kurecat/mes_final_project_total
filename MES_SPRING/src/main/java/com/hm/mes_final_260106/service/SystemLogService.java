package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.entity.LoginLog;
import com.hm.mes_final_260106.repository.LoginLogRepository; // ★ 수정됨
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SystemLogService {

    // ★ 수정: LoginLogRepository 주입
    private final LoginLogRepository loginLogRepository;

    /**
     * 로그인 로그 저장 (LoginLog 엔티티 사용)
     * @param user 사용자 이메일 (LoginLog.email)
     * @param category 카테고리 (LoginLog에는 없으므로 저장 안 함, 필요시 message에 포함)
     * @param message 상세 메시지 (LoginLog.message)
     * @param ip 클라이언트 IP (LoginLog.ipAddress)
     */
    @Transactional
    public void saveLog(String user, String category, String message, String ip) {

        // 메시지에 "FAILED"가 포함되어 있으면 status를 "FAIL", 아니면 "SUCCESS"로 설정
        String status = (message != null && message.toUpperCase().contains("FAILED")) ? "FAIL" : "SUCCESS";

        LoginLog log = LoginLog.builder()
                .email(user)           // ★ 수정: user -> email
                .ipAddress(ip)         // ★ 수정: ip -> ipAddress
                .status(status)        // ★ 수정: level -> status
                .message(message)      // ★ 수정: message 추가
                // .loginTime(...)     // Entity의 @PrePersist가 처리하므로 생략 가능
                .build();

        loginLogRepository.save(log);
    }
}