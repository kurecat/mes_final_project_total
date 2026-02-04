package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.dto.worker.WorkerResDto;
import com.hm.mes_final_260106.entity.Worker;
import com.hm.mes_final_260106.repository.WorkerRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkerService {
    private final WorkerRepository workerRepository;

    @Transactional
    public WorkerResDto findByMemberId(Long memberId) {
        Worker worker = workerRepository.findByMemberId(memberId)
                .orElseThrow(()-> new EntityNotFoundException("작업자를 찾을 수 없습니다"));
        return WorkerResDto.fromEntity(worker);
    }
}
