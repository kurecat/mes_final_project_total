package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.dto.BomReqDto;
import com.hm.mes_final_260106.dto.ProductReqDto;
import com.hm.mes_final_260106.entity.Bom;
import com.hm.mes_final_260106.entity.Material;
import com.hm.mes_final_260106.entity.Product;
import com.hm.mes_final_260106.repository.BomRepository;
import com.hm.mes_final_260106.repository.MaterialRepository;
import com.hm.mes_final_260106.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class MasterDataService {

    private final ProductRepository productRepo;
    private final MaterialRepository materialRepo;
    private final BomRepository bomRepo;

    // 1. 제품 등록
    public void createProduct(ProductReqDto dto) {
        if (productRepo.findByCode(dto.getCode()).isPresent()) {
            throw new RuntimeException("이미 존재하는 제품 코드입니다: " + dto.getCode());
        }

        Product product = Product.builder()
                .code(dto.getCode())
                .name(dto.getName())
                .category(dto.getCategory())
                .spec(dto.getSpec())
                .build();

        productRepo.save(product);
    }

    // 2. BOM 등록 (제품 - 자재 연결)
    public void createBom(BomReqDto dto) {
        Product product = productRepo.findByCode(dto.getProductCode())
                .orElseThrow(() -> new RuntimeException("제품을 찾을 수 없습니다: " + dto.getProductCode()));

        Material material = materialRepo.findByCode(dto.getMaterialCode())
                .orElseThrow(() -> new RuntimeException("자재를 찾을 수 없습니다: " + dto.getMaterialCode()));

        Bom bom = Bom.builder()
                .product(product)
                .material(material)
                .requiredQty(dto.getRequiredQty())
                .build();

        bomRepo.save(bom);
    }

    // 3. 자재 정보 수정 (이름, 카테고리 등)
    public void updateMaterial(String code, String newName, String newCategory) {
        Material material = materialRepo.findByCode(code)
                .orElseThrow(() -> new RuntimeException("자재를 찾을 수 없습니다: " + code));

        material.setName(newName);
        material.setCategory(newCategory);
        // 재고는 여기서 수정하지 않음 (입출고 트랜잭션으로만 변경)
        materialRepo.save(material);
    }
    /// 111111
}