package com.hm.mes_final_260106.exception;

import lombok.Getter;

@Getter
public class CustomException extends RuntimeException{
    private final String code;
    public CustomException(String code, String message) {
        super(message);
        this.code = code;
    }

    // 메시지만 받는 생성자 추가
    public CustomException(String message) {
        super(message);
        this.code = "APP_ERROR"; // 기본 에러 코드 설정
    }
}
