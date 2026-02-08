package com.hm.mes_final_260106.controller;

import com.hm.mes_final_260106.dto.defect.DefectLogDto;
import com.hm.mes_final_260106.service.DefectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mes/quality") // 주소 확인!
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000") // 보안을 위해 * 대신 프론트 주소 명시 권장
public class DefectController {

    private final DefectService defectService;

    @GetMapping("/defect")
    public ResponseEntity<List<DefectLogDto>> getDefectList() {
        return ResponseEntity.ok(defectService.getDefectLogs());
    }
}