package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.constant.BomStatus;
import com.hm.mes_final_260106.constant.EquipmentStatus;
import com.hm.mes_final_260106.constant.WarehouseStatus;
import com.hm.mes_final_260106.dto.bomitem.BomItemResDto;
import com.hm.mes_final_260106.dto.equipment.EquipmentCreateReqDto;
import com.hm.mes_final_260106.dto.equipment.EquipmentResDto;
import com.hm.mes_final_260106.dto.equipment.EquipmentUpdateReqDto;
import com.hm.mes_final_260106.dto.warehouse.WarehouseCreateReqDto;
import com.hm.mes_final_260106.dto.warehouse.WarehouseResDto;
import com.hm.mes_final_260106.dto.bom.BomResDto;
import com.hm.mes_final_260106.dto.bom.BomUpdateReqDto;
import com.hm.mes_final_260106.dto.material.MaterialCreateReqDto;
import com.hm.mes_final_260106.dto.material.MaterialResDto;
import com.hm.mes_final_260106.dto.material.MaterialUpdateReqDto;
import com.hm.mes_final_260106.dto.product.ProductCreateReqDto;
import com.hm.mes_final_260106.dto.product.ProductResDto;
import com.hm.mes_final_260106.dto.product.ProductUpdateReqDto;
import com.hm.mes_final_260106.entity.*;
import com.hm.mes_final_260106.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MasterDataService {

    private final ProductRepository productRepo;
    private final MaterialRepository materialRepo;
    private final BomRepository bomRepo;
    private final BomItemRepository bomItemRepo;
    private final EquipmentRepository equipmentRepo;
    private final WarehouseRepository warehouseRepo;

    // 1. 제품 등록
//    public void createProduct(ProductReqDto dto) {
//        if (productRepo.findByCode(dto.getCode()).isPresent()) {
//            throw new RuntimeException("이미 존재하는 제품 코드입니다: " + dto.getCode());
//        }
//
//        Product product = Product.builder()
//                .code(dto.getCode())
//                .name(dto.getName())
//                .category(dto.getCategory())
//                .spec(dto.getSpec())
//                .build();
//
//        productRepo.save(product);
//    }

    // 2. BOM 등록 (제품 - 자재 연결)
//    public void createBom(BomReqDto dto) {
//        Product product = productRepo.findByCode(dto.getProductCode())
//                .orElseThrow(() -> new RuntimeException("제품을 찾을 수 없습니다: " + dto.getProductCode()));
//
//        Material material = materialRepo.findByCode(dto.getMaterialCode())
//                .orElseThrow(() -> new RuntimeException("자재를 찾을 수 없습니다: " + dto.getMaterialCode()));
//
//        Bom bom = Bom.builder()
//                .product(product)
//                .material(material)
//                .requiredQty(dto.getRequiredQty())
//                .build();
//
//        bomRepo.save(bom);
//    }

//    // 3. 자재 정보 수정 (이름, 카테고리 등)
//    public void updateMaterial(String code, String newName, String newCategory) {
//        Material material = materialRepo.findByCode(code)
//                .orElseThrow(() -> new EntityNotFoundException("자재를 찾을 수 없습니다: " + code));
//
//        material.setName(newName);
//        material.setCategory(newCategory);
//        // 재고는 여기서 수정하지 않음 (입출고 트랜잭션으로만 변경)
//        materialRepo.save(material);
//    }

    // ======== //
    // Material //
    // ======== //

    // CREATE
    public void createMaterial(MaterialCreateReqDto dto) {
        Material material = Material.builder()
                .code(dto.getCode())
                .name(dto.getName())
                .category(dto.getCategory())
                .currentStock(dto.getCurrentStock())
                .safetyStock(dto.getSafetyStock())
                .location(dto.getLocation())
                .build();

        materialRepo.save(material);
    }

    // READ (단건 조회)
    public MaterialResDto getMaterial(Long id) {
        Material material = materialRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 자재가 존재하지 않습니다. id=" + id));

        return toResDto(material);
    }

    // READ (전체 조회)
    public List<MaterialResDto> getAllMaterials() {
        return materialRepo.findAll().stream()
                .map(this::toResDto)
                .collect(Collectors.toList());
    }

    // UPDATE
    public void updateMaterial(Long id, MaterialUpdateReqDto dto) {
        Material material = materialRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 자재가 존재하지 않습니다. id=" + id));

        material.setName(dto.getName());
        material.setCategory(dto.getCategory());
        material.setCurrentStock(dto.getCurrentStock());
        material.setSafetyStock(dto.getSafetyStock());
        material.setLocation(dto.getLocation());

        materialRepo.save(material);
    }

    // DELETE
    public void deleteMaterial(Long id) {
        Material material = materialRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 자재가 존재하지 않습니다. id=" + id));

        materialRepo.delete(material);
    }

    // 공통 변환 함수
    private MaterialResDto toResDto(Material material) {
        return MaterialResDto.builder()
                .id(material.getId())
                .code(material.getCode())
                .name(material.getName())
                .category(material.getCategory())
                .currentStock(material.getCurrentStock())
                .safetyStock(material.getSafetyStock())
                .location(material.getLocation())
                .build();
    }

    // ======= //
    // Product //
    // ======= //

    // CREATE
    public void createProduct(ProductCreateReqDto dto) {
        if (productRepo.findByCode(dto.getCode()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 제품 코드입니다: " + dto.getCode());
        }

        Product product = Product.builder()
                .code(dto.getCode())
                .name(dto.getName())
                .category(dto.getCategory())
                .spec(dto.getSpec())
                .build();

        productRepo.save(product);

        // Product 생성 시 기본 BOM 생성 (revision = 0)
        Bom bom = new Bom();
        bom.setProduct(product);
        bom.setRevision(0); // 최초 리비전
        bom.setStatus(BomStatus.OBSOLETE);
        bomRepo.save(bom);
    }

    // READ (단건 조회)
    public ProductResDto getProduct(Long id) {
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("제품을 찾을 수 없습니다: " + id));

        return toResDto(product);
    }

    // READ (전체 조회)
    public List<ProductResDto> getAllProducts() {
        return productRepo.findAll().stream()
                .map(this::toResDto)
                .collect(Collectors.toList());
    }

    // UPDATE
    public void updateProduct(Long id, ProductUpdateReqDto dto) {
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("제품을 찾을 수 없습니다: " + id));

        product.setCode(dto.getCode());
        product.setName(dto.getName());
        product.setCategory(dto.getCategory());
        product.setSpec(dto.getSpec());

        productRepo.save(product);
    }

    // DELETE
    public void deleteProduct(Long id) {
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("제품을 찾을 수 없습니다: " + id));

        // 연결된 BOM 먼저 제거 (orphanRemoval 활성화)
        product.getBoms().clear();

        // Product 삭제
        productRepo.delete(product);
    }


    // 공통 변환 함수
    private ProductResDto toResDto(Product product) {
        return ProductResDto.builder()
                .id(product.getId())
                .code(product.getCode())
                .name(product.getName())
                .category(product.getCategory())
                .spec(product.getSpec())
                .build();
    }

    // === //
    // BOM //
    // === //

    public List<BomResDto> getAllBom() {
        List<Bom> boms = bomRepo.findLatestBomForAllProductsOrderByProductId();

        return boms.stream()
                .map(bom -> new BomResDto(
                        bom.getId(),
                        bom.getProduct().getCode(),
                        bom.getProduct().getName(),
                        bom.getRevision(),
                        null,
                        null
                ))
                .toList();
    }

    public List<BomItemResDto> getBomItemByBom(Long bomId) {
        List<BomItem> bomItems = bomItemRepo.findAllByBomId(bomId);

        return bomItems.stream()
                .map(item -> new BomItemResDto(
                        item.getId(),
                        item.getMaterial().getCode(),
                        item.getMaterial().getName(),
                        item.getMaterial().getCategory(),
                        item.getRequiredQty(),
                        null
                ))
                .toList();
    }

    // UPDATE
    public void updateBom(Long id, BomUpdateReqDto dto) {
        Bom oldBom = bomRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("BOM을 찾을 수 없습니다: " + id));
        oldBom.setStatus(BomStatus.OBSOLETE);

        Bom newBom = new Bom();
        newBom.setRevision(oldBom.getRevision() + 1);
        newBom.setProduct(oldBom.getProduct());
        newBom.setStatus(BomStatus.OBSOLETE);

        Bom savedBom = bomRepo.save(newBom);

        List<BomItem> newBomItems = dto.getBomItems().stream()
                .map(bomItem -> new BomItem(
                        null,
                        savedBom,
                        materialRepo.findByCode(bomItem.getMaterialCode())
                                .orElseThrow(() -> new EntityNotFoundException("자재를 찾을 수 없습니다: " + bomItem.getMaterialCode())),
                        bomItem.getQuantity()
                ))
                .toList();

        bomItemRepo.saveAll(newBomItems);
    }

    // ========= //
    // Equipment //
    // ========= //

    public List<EquipmentResDto> getAllEquipments() {
        return equipmentRepo.findAll()
                .stream()
                .map(this::toResDto)
                .collect(Collectors.toList());
    }

    public EquipmentResDto getEquipment(Long id) {
        Equipment equipment = equipmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("설비를 찾을 수 없습니다: " + id));
        return toResDto(equipment);
    }

    // CREATE
    public void createEquipment(EquipmentCreateReqDto dto) {
        Equipment equipment = Equipment.builder()
                .code(dto.getCode())
                .name(dto.getName())
                .type(dto.getType())
                .location(dto.getLocation())
                .installDate(dto.getInstallDate())
                .status(EquipmentStatus.IDLE) // 기본 상태 설정
                .build();

        equipmentRepo.save(equipment);
    }

    // UPDATE
    public void updateEquipment(Long id, EquipmentUpdateReqDto dto) {
        Equipment equipment = equipmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("설비를 찾을 수 없습니다: " + id));

        equipment.setCode(dto.getCode());
        equipment.setName(dto.getName());
        equipment.setType(dto.getType());
        equipment.setLocation(dto.getLocation());
        equipment.setInstallDate(dto.getInstallDate());

        equipmentRepo.save(equipment);
    }

    // DELETE
    public void deleteEquipment(Long id) {
        Equipment equipment = equipmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("설비를 찾을 수 없습니다: " + id));
        equipmentRepo.delete(equipment);
    }

    // DTO 변환
    private EquipmentResDto toResDto(Equipment equipment) {
        return EquipmentResDto.builder()
                .id(equipment.getId())
                .code(equipment.getCode())
                .name(equipment.getName())
                .type(equipment.getType())
                .location(equipment.getLocation())
                .status(equipment.getStatus() != null ? equipment.getStatus().name() : null)
                .installDate(equipment.getInstallDate())
                .errorCode(equipment.getErrorCode())
                .updatedAt(equipment.getUpdatedAt())
                .build();
    }

    // ========= //
    // Warehouse //
    // ========= //

    // READ (전체 조회)
    public List<WarehouseResDto> getAllWarehouses() {
        return warehouseRepo.findAll().stream()
                .map(w -> new WarehouseResDto(
                        w.getId(),
                        w.getCode(),
                        w.getName(),
                        w.getType(),
                        w.getAddress(),
                        w.getStatus().toString(),
                        w.getCapacity(),
                        w.getOccupancy()
                ))
                .toList();
    }

    // CREATE
    public void createWarehouse(WarehouseCreateReqDto dto) {
        Warehouse warehouse = Warehouse.builder()
                .code(dto.getCode())
                .name(dto.getName())
                .type(dto.getType())
                .address(dto.getAddress())
                .status(WarehouseStatus.AVAILABLE)
                .capacity(dto.getCapacity())
                .occupancy(0)
                .build();

        warehouseRepo.save(warehouse);
    }

    // UPDATE
    public void updateWarehouse(Long id, WarehouseCreateReqDto dto) {
        Warehouse warehouse = warehouseRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("창고를 찾을 수 없습니다. id=" + id));

        warehouse.setCode(dto.getCode());
        warehouse.setName(dto.getName());
        warehouse.setType(dto.getType());
        warehouse.setAddress(dto.getAddress());
        warehouse.setCapacity(dto.getCapacity());

        if (warehouse.getOccupancy() > warehouse.getCapacity()) {
            warehouse.setStatus(WarehouseStatus.FULL);
        }

        warehouseRepo.save(warehouse);
    }

    // DELETE
    public void deleteWarehouse(Long id) {
        Warehouse warehouse = warehouseRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("창고를 찾을 수 없습니다. id=" + id));

        warehouseRepo.delete(warehouse);
    }

    /// 111111
}