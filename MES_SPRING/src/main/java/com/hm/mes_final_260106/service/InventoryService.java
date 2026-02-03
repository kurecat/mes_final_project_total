package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.constant.MaterialTxType;
import com.hm.mes_final_260106.dto.InventoryResDto;
import com.hm.mes_final_260106.dto.MaterialStockReqDto;
import com.hm.mes_final_260106.dto.MaterialTxResDto;
import com.hm.mes_final_260106.dto.MaterialTxSimpleResDto;
import com.hm.mes_final_260106.entity.Material;
import com.hm.mes_final_260106.entity.MaterialTransaction;
import com.hm.mes_final_260106.repository.MaterialRepository;
import com.hm.mes_final_260106.repository.MaterialTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final MaterialRepository materialRepository;
    private final MaterialTransactionRepository txRepository;
    private final MasterDataService masterDataService;


    // =============================
    // 재고 목록 조회 (현재 상태)
    // =============================
    @Transactional(readOnly = true)
    public List<InventoryResDto> getInventoryList() {
        List<Material> materials = materialRepository.findAll();

        return materials.stream().map(m -> {

            int qty = safeInt(m.getCurrentStock());
            int safety = safeInt(m.getSafetyStock());
            String status;
            if (qty <= 0 ) {
                status = "EMPTY";
            } else if (qty <= safety) {
                status = "LOW";
            } else {
                status = "NORMAL";
            }

            // ⭐ 마지막 입고(INBOUND) 기준 Location
            MaterialTransaction lastInTx = txRepository
                    .findTop1ByMaterial_CodeAndTypeOrderByCreatedAtDesc(
                            m.getCode(),
                            MaterialTxType.INBOUND
                    )
                    .orElse(null);

            return InventoryResDto.builder()
                    .id(m.getCode())
                    .name(m.getName())
                    .type(
                            (m.getCategory() == null || m.getCategory().isBlank())
                                    ? "RAW"
                                    : m.getCategory()
                    )
                    .loc(
                            qty > 0 && lastInTx != null && lastInTx.getTargetLocation() != null
                                    ? lastInTx.getTargetLocation()
                                    : "-"
                    )
                    .qty(qty)
                    .safety(safety)
                    .unit(
                            lastInTx != null && lastInTx.getUnit() != null
                                    ? lastInTx.getUnit()
                                    : "ea"
                    )
                    .status(status)
                    .condition("-")
                    .build();
        }).collect(Collectors.toList()); // ✅ Java 8/11 호환
    }

    // =============================
    // 입고
    // =============================
    @Transactional
    public void stockIn(MaterialStockReqDto req) {
        validateReq(req);

        Material material = materialRepository.findByCode(req.getMaterialCode().trim())
                .orElseThrow(() -> new RuntimeException("자재를 찾을 수 없습니다."));

        int current = safeInt(material.getCurrentStock());
        material.setCurrentStock(current + req.getQty());

        MaterialTransaction tx = MaterialTransaction.builder()
                .type(MaterialTxType.INBOUND)
                .material(material)
                .qty(req.getQty())
                .unit(nullIfBlank(req.getUnit()))
                .targetLocation(nullIfBlank(req.getTargetLocation()))
                .targetEquipment(nullIfBlank(req.getTargetEquipment()))
                .workerName(nullIfBlank(req.getWorkerName()))
                .build();

        txRepository.save(tx);
        materialRepository.save(material);

        if (req.getTargetLocation() != null) {
            masterDataService.applyWarehouseStock(
                    req.getTargetLocation(),
                    req.getQty()
            );
        }
    }

    // =============================
    // 출고
    // =============================
    @Transactional
    public void stockOut(MaterialStockReqDto req) {
        validateReq(req);

        Material material = materialRepository.findByCode(req.getMaterialCode().trim())
                .orElseThrow(() -> new RuntimeException("자재를 찾을 수 없습니다."));

        int current = safeInt(material.getCurrentStock());
        if (current < req.getQty()) {
            throw new RuntimeException("재고 부족");
        }

        material.setCurrentStock(current - req.getQty());

        // ⭐ 출고 Location 보정
        String outLocation = nullIfBlank(req.getTargetLocation());

        if (outLocation == null) {
            // 마지막 입고 Location을 출고 Location으로 사용
            MaterialTransaction lastInTx =
                    txRepository.findTop1ByMaterial_CodeAndTypeOrderByCreatedAtDesc(
                            material.getCode(),
                            MaterialTxType.INBOUND
                    ).orElse(null);

            if (lastInTx != null) {
                outLocation = lastInTx.getTargetLocation();
            }
        }

        MaterialTransaction tx = MaterialTransaction.builder()
                .type(MaterialTxType.OUTBOUND)
                .material(material)
                .qty(req.getQty())
                .unit(nullIfBlank(req.getUnit()))
                .targetLocation(outLocation) // ⭐ 항상 값이 들어가도록
                .targetEquipment(nullIfBlank(req.getTargetEquipment()))
                .workerName(nullIfBlank(req.getWorkerName()))
                .build();

        txRepository.save(tx);
        materialRepository.save(material);

        if (outLocation != null) {
            masterDataService.applyWarehouseStock(
                    outLocation,
                    -req.getQty()
            );
        }
    }


    // =============================
    // 최근 트랜잭션 로그 (이력 그대로)
    // =============================
    @Transactional(readOnly = true)
    public List<MaterialTxSimpleResDto> getRecentTxLogs(int limit) {

        List<MaterialTransaction> list =
                txRepository.findTop5ByOrderByCreatedAtDesc(); // limit 확장 가능

        return list.stream()
                .map(tx ->
                        MaterialTxSimpleResDto.builder()
                                .id(tx.getId())
                                .createdAt(tx.getCreatedAt().toString())
                                .type(tx.getType().name().startsWith("IN") ? "IN" : "OUT")
                                .materialName(tx.getMaterial().getName())
                                .qty(tx.getQty())
                                // ⭐ 트랜잭션 당시 Location 그대로
                                .location(
                                        tx.getTargetLocation() != null
                                                ? tx.getTargetLocation()
                                                : "-"
                                )
                                .worker(tx.getWorkerName())
                                .build()
                )
                .collect(Collectors.toList());
    }
    // =============================
// 자재별 트랜잭션 로그 조회 (상세)
// =============================
    @Transactional(readOnly = true)
    public List<MaterialTxResDto> getTxLogs(String materialCode) {

        if (materialCode == null || materialCode.isBlank()) {
            throw new RuntimeException("materialCode가 비어있습니다.");
        }

        List<MaterialTransaction> list =
                txRepository.findByMaterial_CodeOrderByCreatedAtDesc(materialCode.trim());

        return list.stream()
                .map(tx -> MaterialTxResDto.builder()
                        .txId(tx.getId())
                        .time(tx.getCreatedAt())
                        .type(tx.getType())
                        .materialName(tx.getMaterial().getName())
                        .qty(tx.getQty())
                        .unit(tx.getUnit())
                        // ⭐ 이력 그대로 (재계산 ❌)
                        .targetLocation(
                                tx.getTargetLocation() != null
                                        ? tx.getTargetLocation()
                                        : "-"
                        )
                        .targetEquipment(tx.getTargetEquipment())
                        .workerName(tx.getWorkerName())
                        .build()
                )
                .collect(java.util.stream.Collectors.toList());
    }


    // =============================
    // 공통 유틸
    // =============================
    private void validateReq(MaterialStockReqDto req) {
        if (req == null || req.getMaterialCode() == null || req.getMaterialCode().isBlank()) {
            throw new RuntimeException("materialCode가 비어있습니다.");
        }
        if (req.getQty() == null || req.getQty() <= 0) {
            throw new RuntimeException("수량(qty)은 1 이상이어야 합니다.");
        }
    }

    private int safeInt(Integer v) {
        return v == null ? 0 : v;
    }

    private String nullIfBlank(String v) {
        if (v == null) return null;
        String t = v.trim();
        return t.isEmpty() ? null : t;
    }
}
