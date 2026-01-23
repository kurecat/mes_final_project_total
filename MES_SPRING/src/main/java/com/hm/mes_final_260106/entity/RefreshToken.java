// [수정 이유] FK 제약조건 제거 - Member 테이블과 독립적으로 운영

package com.hm.mes_final_260106.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "refresh_token")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ 핵심: FK 제약조건 없이 그냥 Long 타입으로만 저장
    // JPA가 자동으로 FK 만드는 걸 방지하기 위해 @Column만 사용
    @Column(name = "member_id", unique = true, nullable = false)
    private Long memberId;

    @Column(name = "token", nullable = false, length = 500)
    private String token;

    public void updateToken(String token) {
        this.token = token;
    }
}