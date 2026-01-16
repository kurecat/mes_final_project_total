package com.hm.mes_final_260106.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter @NoArgsConstructor
public class Products { // 에러 메시지에 찍힌 그 클래스명

    @Id // ★ 이게 없어서 서버가 안 뜨는 겁니다!
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;
}