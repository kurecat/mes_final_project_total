package com.hm.mes_final_260106.controller;

import com.hm.mes_final_260106.dto.BomReqDto;
import com.hm.mes_final_260106.dto.ProductReqDto;
import com.hm.mes_final_260106.service.MasterDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mes/master")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class MasterDataController {

    private final MasterDataService masterService;

    // 1. 제품 등록
    @PostMapping("/product")
    public ResponseEntity<String> createProduct(@RequestBody ProductReqDto dto) {
        masterService.createProduct(dto);
        return ResponseEntity.ok("제품 등록 완료: " + dto.getName());
    }

    // 2. BOM 등록
    @PostMapping("/bom")
    public ResponseEntity<String> createBom(@RequestBody BomReqDto dto) {
        masterService.createBom(dto);
        return ResponseEntity.ok("BOM 등록 완료");
    }

    // 3. 자재 정보 수정
    @PutMapping("/material/{code}")
    public ResponseEntity<String> updateMaterial(
            @PathVariable String code,
            @RequestParam String name,
            @RequestParam String category
    ) {
        masterService.updateMaterial(code, name, category);
        return ResponseEntity.ok("자재 정보 수정 완료");
    }
}