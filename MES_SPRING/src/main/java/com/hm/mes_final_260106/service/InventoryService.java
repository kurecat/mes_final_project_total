package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.constant.MaterialTxType;
import com.hm.mes_final_260106.dto.InventoryResDto;
import com.hm.mes_final_260106.dto.MaterialStockReqDto;
import com.hm.mes_final_260106.dto.MaterialTxResDto;
import com.hm.mes_final_260106.entity.Material;
import com.hm.mes_final_260106.entity.MaterialTransaction;
import com.hm.mes_final_260106.repository.MaterialRepository;
import com.hm.mes_final_260106.repository.MaterialTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final MaterialRepository materialRepository;
    private final MaterialTransactionRepository txRepository;

    // =============================
    // 재고 목록 조회
    // =============================
    @Transactional(readOnly = true)
    public List<InventoryResDto> getInventoryList() {
        List<Material> materials = materialRepository.findAll();

        return materials.stream().map(m -> {

            MaterialTransaction lastTx = txRepository
                    .findTop1ByMaterial_CodeOrderByCreatedAtDesc(m.getCode())
                    .orElse(null);

            int qty = safeInt(m.getCurrentStock());

            // 현재 Material 엔티티에 safetyStock이 없으므로 임시값(0)
            int safety = 0;

            String status = (qty <= safety) ? "LOW" : "NORMAL";

            return InventoryResDto.builder()
                    .id(m.getCode())
                    .name(m.getName())
                    .type((m.getCategory() == null || m.getCategory().isBlank()) ? "RAW" : m.getCategory())
                    .loc(lastTx != null && lastTx.getTargetLocation() != null ? lastTx.getTargetLocation() : "-")
                    .qty(qty)
                    .safety(safety)
                    .unit(lastTx != null && lastTx.getUnit() != null ? lastTx.getUnit() : "ea")
                    .status(status)
                    .condition("-") // 현재 엔티티에 없음
                    .build();
        }).toList();
    }

    // =============================
    // 입고
    // =============================
    @Transactional
    public void stockIn(MaterialStockReqDto req) {
        validateReq(req);

        String materialCode = req.getMaterialCode().trim();

        Material material = materialRepository.findByCode(materialCode)
                .orElseThrow(() -> new RuntimeException("자재를 찾을 수 없습니다: " + materialCode));

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
    }

    // =============================
    // 출고 (Issue)
    // =============================
    @Transactional
    public void stockOut(MaterialStockReqDto req) {
        validateReq(req);

        String materialCode = req.getMaterialCode().trim();

        Material material = materialRepository.findByCode(materialCode)
                .orElseThrow(() -> new RuntimeException("자재를 찾을 수 없습니다: " + materialCode));

        int current = safeInt(material.getCurrentStock());

        if (current < req.getQty()) {
            throw new RuntimeException("재고 부족: 현재=" + current + ", 요청=" + req.getQty());
        }

        material.setCurrentStock(current - req.getQty());

        MaterialTransaction tx = MaterialTransaction.builder()
                .type(MaterialTxType.OUTBOUND)
                .material(material)
                .qty(req.getQty())
                .unit(nullIfBlank(req.getUnit()))
                .targetLocation(nullIfBlank(req.getTargetLocation()))
                .targetEquipment(nullIfBlank(req.getTargetEquipment()))
                .workerName(nullIfBlank(req.getWorkerName()))
                .build();

        txRepository.save(tx);
        materialRepository.save(material);
    }

    // =============================
    // 트랜잭션 로그 조회
    // =============================
    @Transactional(readOnly = true)
    public List<MaterialTxResDto> getTxLogs(String materialCode) {
        if (materialCode == null || materialCode.isBlank()) {
            throw new RuntimeException("materialCode가 비어있습니다.");
        }

        List<MaterialTransaction> list =
                txRepository.findByMaterial_CodeOrderByCreatedAtDesc(materialCode.trim());

        return list.stream().map(tx -> MaterialTxResDto.builder()
                .txId(tx.getId())
                .time(tx.getCreatedAt())
                .type(tx.getType())
                .materialName(tx.getMaterial().getName())
                .qty(tx.getQty())
                .unit(tx.getUnit())
                .targetLocation(tx.getTargetLocation())
                .targetEquipment(tx.getTargetEquipment())
                .workerName(tx.getWorkerName())
                .build()
        ).toList();
    }

    // =============================
    // 공통 유틸
    // =============================
    private void validateReq(MaterialStockReqDto req) {
        if (req == null) {
            throw new RuntimeException("요청 바디가 비어있습니다.");
        }
        if (req.getMaterialCode() == null || req.getMaterialCode().isBlank()) {
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
