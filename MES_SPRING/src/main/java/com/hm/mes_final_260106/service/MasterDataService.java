package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.constant.BomStatus;
import com.hm.mes_final_260106.constant.WarehouseStatus;
import com.hm.mes_final_260106.dto.bomItem.BomItemResDto;
import com.hm.mes_final_260106.dto.EquipmentCreateReqDto;
import com.hm.mes_final_260106.dto.Warehouse.WarehouseCreateReqDto;
import com.hm.mes_final_260106.dto.Warehouse.WarehouseResDto;
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

    // 3. 자재 정보 수정 (이름, 카테고리 등)
    public void updateMaterial(String code, String newName, String newCategory) {
        Material material = materialRepo.findByCode(code)
                .orElseThrow(() -> new EntityNotFoundException("자재를 찾을 수 없습니다: " + code));

        material.setName(newName);
        material.setCategory(newCategory);
        // 재고는 여기서 수정하지 않음 (입출고 트랜잭션으로만 변경)
        materialRepo.save(material);
    }

    // CREATE PRODUCT
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
        bom.setRevision(0);               // 최초 리비전

        bomRepo.save(bom);
    }

    // READ (단건 조회) PRODUCT
    public ProductResDto getProduct(Long id) {
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("제품을 찾을 수 없습니다: " + id));

        return ProductResDto.builder()
                .id(product.getId())
                .code(product.getCode())
                .name(product.getName())
                .category(product.getCategory())
                .spec(product.getSpec())
                .build();
    }

    // READ (전체 조회) PRODUCT
    public List<ProductResDto> getAllProducts() {
        return productRepo.findAll().stream()
                .map(product -> ProductResDto.builder()
                        .id(product.getId())
                        .code(product.getCode())
                        .name(product.getName())
                        .category(product.getCategory())
                        .spec(product.getSpec())
                        .build())
                .collect(Collectors.toList());
    }

    // UPDATE PRODUCT
    public void updateProduct(Long id, ProductUpdateReqDto dto) {
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("제품을 찾을 수 없습니다: " + id));

        product.setCode(dto.getCode());
        product.setName(dto.getName());
        product.setCategory(dto.getCategory());
        product.setSpec(dto.getSpec());

        productRepo.save(product);
    }

    // DELETE PRODUCT
    public void deleteProduct(Long id) {
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("제품을 찾을 수 없습니다: " + id));

        productRepo.delete(product);
    }

    public List<BomResDto> getAllBom() {
        List<Bom> boms = bomRepo.findLatestBomForAllProductsOrderByProductId();

        return boms
                .stream()
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

        return bomItems
                .stream()
                .map(bomItem -> new BomItemResDto(
                        bomItem.getId(),
                        bomItem.getMaterial().getCode(),
                        bomItem.getMaterial().getName(),
                        bomItem.getMaterial().getCategory(),
                        bomItem.getRequiredQty(),
                        null
                ))
                .toList();
    }

    // UPDATE BOM
    public void updateBom(Long id, BomUpdateReqDto dto) {
        Bom oldBom = bomRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("BOM not found"));
        oldBom.setStatus(BomStatus.OBSOLETE);

        Bom newBom = new Bom();
        newBom.setRevision(oldBom.getRevision() + 1);
        newBom.setProduct(oldBom.getProduct());
        newBom.setStatus(BomStatus.OBSOLETE);

        Bom finalNewBom = bomRepo.save(newBom);
        List<BomItem> newBomItems = dto.getBomItems()
                .stream()
                .map(bomItem -> new BomItem(
                        null,
                        finalNewBom,
                        materialRepo.findByCode(bomItem.getMaterialCode())
                                .orElseThrow((() -> new EntityNotFoundException("자재를 찾을 수 없습니다"))),
                        bomItem.getQuantity()))
                .toList();

        bomItemRepo.saveAll(newBomItems);
    }

    public void createEquipment(EquipmentCreateReqDto dto) {
    }

    public List<WarehouseResDto> getAllWarehouses() {
        List<Warehouse> warehouses = warehouseRepo.findAll();

        return warehouses.stream()
                .map(warehouse -> new WarehouseResDto(
                        warehouse.getId(),
                        warehouse.getCode(),
                        warehouse.getName(),
                        warehouse.getType(),
                        warehouse.getAddress(),
                        warehouse.getStatus().toString(),
                        warehouse.getCapacity(),
                        warehouse.getOccupancy()
                ))
                .toList();

    }

    public void createWarehouse(WarehouseCreateReqDto reqDto) {
        Warehouse warehouse = Warehouse.builder()
                .code(reqDto.getCode())
                .name(reqDto.getName())
                .type(reqDto.getType())
                .address(reqDto.getAddress())
                .status(WarehouseStatus.AVAILABLE)
                .capacity(reqDto.getCapacity())
                .occupancy(0)
                .build();

        warehouseRepo.save(warehouse);
    }

    public void updateWarehouse(Long id, WarehouseCreateReqDto dto) {
        Warehouse warehouse = warehouseRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found with id: " + id));

        warehouse.setCode(dto.getCode());
        warehouse.setName(dto.getName());
        warehouse.setType(dto.getType());
        warehouse.setAddress(dto.getAddress());
        warehouse.setCapacity(dto.getCapacity());

        if (warehouse.getOccupancy() > warehouse.getCapacity())
            warehouse.setStatus(WarehouseStatus.FULL);

        warehouseRepo.save(warehouse);
    }

    public void deleteWarehouse(Long id) {
        Warehouse warehouse = warehouseRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found with id: " + id));

        warehouseRepo.delete(warehouse);
    }

    // CREATE
    public void createMaterial(MaterialCreateReqDto dto) {
        Material material = new Material();
        material.setCode(dto.getCode());
        material.setName(dto.getName());
        material.setCategory(dto.getCategory());
        material.setCurrentStock(dto.getCurrentStock());
        material.setSafetyStock(dto.getSafetyStock());
        material.setLocation(dto.getLocation());

        materialRepo.save(material);
    }

    // READ (단건 조회)
    public MaterialResDto getMaterial(Long id) {
        Material material = materialRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 자재가 존재하지 않습니다. id=" + id));

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

    // READ (전체 조회)
    public List<MaterialResDto> getAllMaterials() {
        return materialRepo.findAll().stream()
                .map(material -> MaterialResDto.builder()
                        .id(material.getId())
                        .code(material.getCode())
                        .name(material.getName())
                        .category(material.getCategory())
                        .currentStock(material.getCurrentStock())
                        .safetyStock(material.getSafetyStock())
                        .location(material.getLocation())
                        .build())
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
    /// 111111
}