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
    private String ipAddress;   // 접속 IP (실제론 Request에서 추출)
    private String status;      // SUCCESS / FAIL

    @Column(updatable = false)
    private LocalDateTime loginTime; // 접속 시간

    @PrePersist
    public void prePersist() {
        this.loginTime = LocalDateTime.now();
    }
}
///1111111