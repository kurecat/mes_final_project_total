package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.dto.GlobalResponseDto;
import com.hm.mes_final_260106.dto.MemberResDto; // 기존 DTO 재활용
import com.hm.mes_final_260106.entity.CommonCode;
import com.hm.mes_final_260106.entity.LoginLog;
import com.hm.mes_final_260106.repository.CommonCodeRepository;
import com.hm.mes_final_260106.repository.LoginLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SystemService {

    private final CommonCodeRepository codeRepository;
    private final LoginLogRepository logRepository;
    private final AuthService authService; // 기존 AuthService 재활용 (회원조회용)

    // 1. 공통 코드 조회
    public List<CommonCode> getCodes(String groupCode) {
        if (groupCode != null && !groupCode.isEmpty()) {
            return codeRepository.findByGroupCodeOrderBySortOrderAsc(groupCode);
        }
        return codeRepository.findAllByOrderByGroupCodeAscSortOrderAsc();
    }

    // [공통 코드 저장/수정]
    public CommonCode saveCode(CommonCode code) {
        return codeRepository.save(code);
    }


    // 3. 로그 조회
    public List<LoginLog> getLogs() {
        // findAll() 대신 이거 쓰면 최신순 정렬돼서 나옵니다. 개꿀.
        return logRepository.findAllByOrderByLoginTimeDesc();
    }

    // 4. 권한(멤버) 목록 조회
    public GlobalResponseDto<List<MemberResDto>> getMembers() {
        return authService.findAll(); // 형님이 AuthService에 만들어둔거 그대로 호출
    }
}