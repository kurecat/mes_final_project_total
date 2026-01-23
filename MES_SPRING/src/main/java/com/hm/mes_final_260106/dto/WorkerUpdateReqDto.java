package com.hm.mes_final_260106.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class WorkerUpdateReqDto {

    // 수정 가능한 값들만
    private String name;        // Member.name
    private String authority;   // Member.authority

    private String dept;        // Worker.dept
    private String shift;       // Worker.shift
    private String status;      // Worker.status
    private List<String> certifications; // Worker.certifications
}
///1111111111