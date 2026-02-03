package com.hm.mes_final_260106.controller;

import com.hm.mes_final_260106.dto.equipment.EquipmentCreateReqDto;
import com.hm.mes_final_260106.dto.equipment.EquipmentResDto;
import com.hm.mes_final_260106.dto.equipment.EquipmentUpdateReqDto;
import com.hm.mes_final_260106.dto.warehouse.WarehouseCreateReqDto;
import com.hm.mes_final_260106.dto.warehouse.WarehouseResDto;
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

    // ======== //
    // Material //
    // ======== //

    @PostMapping("/material")
    public ResponseEntity<String> createMaterial(@RequestBody MaterialCreateReqDto dto) {
        masterService.createMaterial(dto);
        return ResponseEntity.ok("자재 등록 완료");
    }

    @GetMapping("/material/{id}")
    public ResponseEntity<MaterialResDto> getMaterial(@PathVariable Long id) {
        return ResponseEntity.ok(masterService.getMaterial(id));
    }

    @GetMapping("/material/list")
    public ResponseEntity<List<MaterialResDto>> getAllMaterials() {
        return ResponseEntity.ok(masterService.getAllMaterials());
    }

    @PutMapping("/material/{id}")
    public ResponseEntity<String> updateMaterial(@PathVariable Long id,
                                                 @RequestBody MaterialUpdateReqDto dto) {
        masterService.updateMaterial(id, dto);
        return ResponseEntity.ok("자재 수정 완료");
    }

    @DeleteMapping("/material/{id}")
    public ResponseEntity<String> deleteMaterial(@PathVariable Long id) {
        masterService.deleteMaterial(id);
        return ResponseEntity.ok("자재 삭제 완료");
    }

    // ======= //
    // Product //
    // ======= //

    @PostMapping("/product")
    public ResponseEntity<String> createProduct(@RequestBody ProductCreateReqDto dto) {
        masterService.createProduct(dto);
        return ResponseEntity.ok("상품 등록 완료");
    }

    @GetMapping("/product/{id}")
    public ResponseEntity<ProductResDto> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(masterService.getProduct(id));
    }

    @GetMapping("/product/list")
    public ResponseEntity<List<ProductResDto>> getAllProducts() {
        return ResponseEntity.ok(masterService.getAllProducts());
    }

    @PutMapping("/product/{id}")
    public ResponseEntity<String> updateProduct(@PathVariable Long id,
                                                @RequestBody ProductUpdateReqDto dto) {
        masterService.updateProduct(id, dto);
        return ResponseEntity.ok("상품 수정 완료");
    }

    @DeleteMapping("/product/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        masterService.deleteProduct(id);
        return ResponseEntity.ok("상품 삭제 완료");
    }

    // === //
    // BOM //
    // === //

    @GetMapping("/bom/list")
    public ResponseEntity<List<BomResDto>> getBoms() {
        return ResponseEntity.ok(masterService.getAllBom());
    }

    @GetMapping("/bom-item/{bomId}")
    public ResponseEntity<List<BomItemResDto>> getBomItemsByBom(@PathVariable Long bomId) {
        return ResponseEntity.ok(masterService.getBomItemByBom(bomId));
    }

    @PutMapping("/bom/{id}")
    public ResponseEntity<String> updateBom(@PathVariable Long id,
                                            @RequestBody BomUpdateReqDto dto) {
        masterService.updateBom(id, dto);
        return ResponseEntity.ok("BOM 수정 완료");
    }

    // ========= //
    // Equipment //
    // ========= //

    @PostMapping("/equipment")
    public ResponseEntity<String> createEquipment(@RequestBody EquipmentCreateReqDto dto) {
        masterService.createEquipment(dto);
        return ResponseEntity.ok("설비 등록 완료");
    }

    @GetMapping("/equipment/{id}")
    public ResponseEntity<EquipmentResDto> getEquipment(@PathVariable Long id) {
        return ResponseEntity.ok(masterService.getEquipment(id));
    }

    @GetMapping("/equipment/list")
    public ResponseEntity<List<EquipmentResDto>> getAllEquipments() {
        return ResponseEntity.ok(masterService.getAllEquipments());
    }

    @PutMapping("/equipment/{id}")
    public ResponseEntity<String> updateEquipment(@PathVariable Long id,
                                                  @RequestBody EquipmentUpdateReqDto dto) {
        masterService.updateEquipment(id, dto);
        return ResponseEntity.ok("설비 수정 완료");
    }

    @DeleteMapping("/equipment/{id}")
    public ResponseEntity<String> deleteEquipment(@PathVariable Long id) {
        masterService.deleteEquipment(id);
        return ResponseEntity.ok("설비 삭제 완료");
    }

    // ========= //
    // Warehouse //
    // ========= //

    @GetMapping("/warehouse/list")
    public ResponseEntity<List<WarehouseResDto>> getAllWarehouses() {
        return ResponseEntity.ok(masterService.getAllWarehouses());
    }

    @PostMapping("/warehouse")
    public ResponseEntity<String> createWarehouse(@RequestBody WarehouseCreateReqDto dto) {
        masterService.createWarehouse(dto);
        return ResponseEntity.ok("창고 등록 완료");
    }

    @PutMapping("/warehouse/{id}")
    public ResponseEntity<String> updateWarehouse(@PathVariable Long id,
                                                  @RequestBody WarehouseCreateReqDto dto) {
        masterService.updateWarehouse(id, dto);
        return ResponseEntity.ok("창고 수정 완료");
    }

    @DeleteMapping("/warehouse/{id}")
    public ResponseEntity<String> deleteWarehouse(@PathVariable Long id) {
        masterService.deleteWarehouse(id);
        return ResponseEntity.ok("창고 삭제 완료");
    }
}