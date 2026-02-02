package com.hm.mes_final_260106.controller;

import com.hm.mes_final_260106.dto.EquipmentCreateReqDto;
import com.hm.mes_final_260106.dto.Warehouse.WarehouseCreateReqDto;
import com.hm.mes_final_260106.dto.Warehouse.WarehouseResDto;
import com.hm.mes_final_260106.dto.bom.BomResDto;
import com.hm.mes_final_260106.dto.bom.BomUpdateReqDto;
import com.hm.mes_final_260106.dto.bomitem.BomItemResDto;
import com.hm.mes_final_260106.dto.material.MaterialCreateReqDto;
import com.hm.mes_final_260106.dto.material.MaterialResDto;
import com.hm.mes_final_260106.dto.material.MaterialUpdateReqDto;
import com.hm.mes_final_260106.dto.product.ProductCreateReqDto;
import com.hm.mes_final_260106.dto.product.ProductResDto;
import com.hm.mes_final_260106.dto.product.ProductUpdateReqDto;
import com.hm.mes_final_260106.service.MasterDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mes/master")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class MasterDataController {

    private final MasterDataService masterService;

    // 1. 제품 등록
//    @PostMapping("/product")
//    public ResponseEntity<String> createProduct(@RequestBody ProductReqDto dto) {
//        masterService.createProduct(dto);
//        return ResponseEntity.ok("제품 등록 완료: " + dto.getName());
//    }

    // 2. BOM 등록
//    @PostMapping("/bom")
//    public ResponseEntity<String> createBom(@RequestBody BomReqDto dto) {
//        masterService.createBom(dto);
//        return ResponseEntity.ok("BOM 등록 완료");
//    }

//    // 3. 자재 정보 수정
//    @PutMapping("/material/{code}")
//    public ResponseEntity<String> updateMaterial(
//            @PathVariable String code,
//            @RequestParam String name,
//            @RequestParam String category
//    ) {
//        masterService.updateMaterial(code, name, category);
//        return ResponseEntity.ok("자재 정보 수정 완료");
//    }

    // CREATE
    @PostMapping("/material")
    public ResponseEntity<String> createMaterial(@RequestBody MaterialCreateReqDto dto) {
        masterService.createMaterial(dto);
        return ResponseEntity.ok("자재 등록 완료");
    }

    // READ (단건 조회)
    @GetMapping("/material/{id}")
    public ResponseEntity<MaterialResDto> getMaterial(@PathVariable Long id) {
        MaterialResDto material = masterService.getMaterial(id);
        return ResponseEntity.ok(material);
    }

    // READ (전체 조회)
    @GetMapping("/material/list")
    public ResponseEntity<List<MaterialResDto>> getAllMaterials() {
        List<MaterialResDto> materials = masterService.getAllMaterials();
        return ResponseEntity.ok(materials);
    }

    // UPDATE
    @PutMapping("/material/{id}")
    public ResponseEntity<String> updateMaterial(@PathVariable Long id,
                                                 @RequestBody MaterialUpdateReqDto dto) {
        masterService.updateMaterial(id, dto);
        return ResponseEntity.ok("자재 수정 완료");
    }

    // DELETE
    @DeleteMapping("/material/{id}")
    public ResponseEntity<String> deleteMaterial(@PathVariable Long id) {
        masterService.deleteMaterial(id);
        return ResponseEntity.ok("자재 삭제 완료");
    }


    // CREATE
    @PostMapping("/product")
    public ResponseEntity<String> createProduct(@RequestBody ProductCreateReqDto dto) {
        masterService.createProduct(dto);
        return ResponseEntity.ok("상품 등록 완료");
    }

    // READ (단건 조회)
    @GetMapping("/product/{id}")
    public ResponseEntity<ProductResDto> getProduct(@PathVariable Long id) {
        ProductResDto product = masterService.getProduct(id);
        return ResponseEntity.ok(product);
    }

    // READ (전체 조회)
    @GetMapping("/product/list")
    public ResponseEntity<List<ProductResDto>> getAllProducts() {
        List<ProductResDto> products = masterService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    // UPDATE
    @PutMapping("/product/{id}")
    public ResponseEntity<String> updateProduct(@PathVariable Long id,
                                                @RequestBody ProductUpdateReqDto dto) {
        masterService.updateProduct(id, dto);
        return ResponseEntity.ok("상품 수정 완료");
    }

    // DELETE
    @DeleteMapping("/product/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        masterService.deleteProduct(id);
        return ResponseEntity.ok("상품 삭제 완료");
    }

    // READ (전체 BOM 조회)
    @GetMapping("/bom/list")
    public ResponseEntity<List<BomResDto>> getBoms() {
        List<BomResDto> bomResDtos = masterService.getAllBom();
        return ResponseEntity.ok(bomResDtos);
    }

    // READ (BOM Item list 조회)
    @GetMapping("/bom-item/{bomId}")
    public ResponseEntity<List<BomItemResDto>> getBomItemsByBom(@PathVariable Long bomId) {
        List<BomItemResDto> bomItemResDtos = masterService.getBomItemByBom(bomId);
        return ResponseEntity.ok(bomItemResDtos);
    }

    // UPDATE (BOM 수정)
    @PutMapping("/bom/{id}")
    public ResponseEntity<String> updateBom(@PathVariable Long id,
                                            @RequestBody BomUpdateReqDto dto) {
        masterService.updateBom(id, dto);
        return ResponseEntity.ok("BOM 수정 완료");
    }

    @PostMapping("/equipment")
    public ResponseEntity<String> createEquipment(@RequestBody EquipmentCreateReqDto dto) {
        masterService.createEquipment(dto);
        return ResponseEntity.ok("설비 등록 완료");
    }

    @GetMapping("/warehouse/list")
    public ResponseEntity<List<WarehouseResDto>> getAllWarehouses() {
        List<WarehouseResDto> Warehouses = masterService.getAllWarehouses();
        return ResponseEntity.ok(Warehouses);
    }

    @PostMapping("/warehouse")
    public ResponseEntity<String> createWarehouse(@RequestBody WarehouseCreateReqDto dto) {
        masterService.createWarehouse(dto);
        return ResponseEntity.ok("창고 등록 완료");
    }

    @PutMapping("/warehouse/{id}")
    public ResponseEntity<String> UpdateWarehouse(
            @PathVariable Long id,
            @RequestBody WarehouseCreateReqDto dto) {
        masterService.updateWarehouse(id, dto);
        return ResponseEntity.ok("창고 수정 완료");
    }

    @DeleteMapping("/warehouse/{id}")
    public ResponseEntity<String> deleteWarehouse(@PathVariable Long id) {
        masterService.deleteWarehouse(id);
        return ResponseEntity.ok("창고 삭제 완료");
    }

    /// 1111111
}