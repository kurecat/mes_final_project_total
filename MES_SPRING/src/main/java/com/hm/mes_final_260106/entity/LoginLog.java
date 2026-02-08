package com.hm.mes_final_260106.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "login_log")
@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;       // 로그인 시도한 이메일
    private String ipAddress;   // 접속 IP
    private String status;      // SUCCESS 또는 FAIL

    // ★ [추가] 실패 사유나 상세 메시지를 저장할 컬럼
    @Column(length = 255)
    private String message;

    @Column(updatable = false)
    private LocalDateTime loginTime;

    @PrePersist
    public void prePersist() {
        this.loginTime = LocalDateTime.now();
    }
}