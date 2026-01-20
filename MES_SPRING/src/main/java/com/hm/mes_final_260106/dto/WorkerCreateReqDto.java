package com.hm.mes_final_260106.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class WorkerCreateReqDto {

    // Member 정보
    private String email;
    private String password;
    private String name;
    private String authority;

    // Worker 정보
    private String dept;
    private String shift;
    private String status;
    private LocalDate joinDate;
    private List<String> certifications;
}
