package com.hm.mes_final_260106.dto;

import com.hm.mes_final_260106.entity.Worker;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Data
@Builder
public class WorkerResDto {

    private Long workerId;
    private String name;
    private String dept;
    private String shift;
    private String status;
    private LocalDate joinDate;
    private List<String> certifications;

    public static WorkerResDto fromEntity(Worker w) {
        List<String> certList =
                (w.getCertifications() == null || w.getCertifications().isBlank())
                        ? List.of()
                        : Arrays.stream(w.getCertifications().split(","))
                        .map(String::trim)
                        .toList();

        return WorkerResDto.builder()
                .workerId(w.getId())
                .name(w.getName())
                .dept(w.getDept())
                .shift(w.getShift())
                .status(w.getStatus())
                .joinDate(w.getJoinDate())
                .certifications(certList)
                .build();
    }
}
///1111111111