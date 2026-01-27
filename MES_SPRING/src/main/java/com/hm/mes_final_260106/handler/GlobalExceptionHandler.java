package com.hm.mes_final_260106.handler;

import com.hm.mes_final_260106.dto.ErrorResDto;
import com.hm.mes_final_260106.exception.CustomException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ErrorResDto> handleCustomException(CustomException e) {
        return ResponseEntity
                .badRequest()
                .body(new ErrorResDto(e.getCode(), e.getMessage()));
    }
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResDto> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity
                .badRequest()
                .body(new ErrorResDto("INVALID_ARGUMENT", e.getMessage()));
    }
}