package com.hm.mes_final_260106.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GlobalResponseDto<T> {
    private boolean success;
    private String message;
    private T data;

    public static <T> GlobalResponseDto<T> success(String message, T data) {
        return GlobalResponseDto.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> GlobalResponseDto<T> fail(String message) {
        return GlobalResponseDto.<T>builder()
                .success(false)
                .message(message)
                .data(null)
                .build();
    }
}
