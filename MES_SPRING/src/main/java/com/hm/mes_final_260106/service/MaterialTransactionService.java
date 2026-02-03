package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.constant.MaterialTxType;
import com.hm.mes_final_260106.constant.WarehouseStatus;
import com.hm.mes_final_260106.dto.MaterialInboundReqDto;
import com.hm.mes_final_260106.dto.MaterialOutboundReqDto;
import com.hm.mes_final_260106.dto.MaterialTxResDto;
import com.hm.mes_final_260106.entity.Material;
import com.hm.mes_final_260106.entity.MaterialTransaction;
import com.hm.mes_final_260106.entity.Warehouse;
import com.hm.mes_final_260106.exception.CustomException;
import com.hm.mes_final_260106.repository.MaterialRepository;
import com.hm.mes_final_260106.repository.MaterialTransactionRepository;
import com.hm.mes_final_260106.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MaterialTransactionService {

    private final MaterialRepository materialRepo;
    private final MaterialTransactionRepository txRepo;
    private final WarehouseRepository warehouseRepo;

    // =========================
    // 입고 처리
    // =========================
    public MaterialTxResDto inbound(MaterialInboundReqDto req) {

        validateCommon(req.getMaterialBarcode(), req.getQty());

        Material material = materialRepo.findByCode(req.getMaterialBarcode())
                .orElseThrow(() -> new CustomException("NOT_FOUND",
                        "해당 바코드의 자재가 존재하지 않습니다: " + req.getMaterialBarcode()));

        // 1) 재고 증가
        int currentStock = safeInt(material.getCurrentStock());
        material.setCurrentStock(currentStock + req.getQty());

        // 2) 창고 occupancy 증가 (targetLocation을 warehouse.code 로 간주)
        String whCode = nullIfBlank(req.getTargetLocation());
        if (whCode != null) {
            Warehouse wh = warehouseRepo.findByCode(whCode)
                    .orElseThrow(() -> new CustomException("NOT_FOUND",
                            "해당 창고(code)를 찾을 수 없습니다: " + whCode));

            int occ = safeInt(wh.getOccupancy());
            int cap = safeInt(wh.getCapacity());

            // FULL 입고 차단 (백엔드)
            if (cap > 0 && occ + req.getQty() > cap) {
                wh.setStatus(WarehouseStatus.FULL);
                throw new CustomException("WAREHOUSE_FULL",
                        "FULL 창고입니다: " + whCode + " (" + occ + "/" + cap + ")");
            }

            wh.setOccupancy(occ + req.getQty());
            wh.setStatus(calcWarehouseStatus(wh.getOccupancy(), wh.getCapacity()));
            warehouseRepo.save(wh);
        }

        // 3) 트랜잭션 생성
        MaterialTransaction tx = MaterialTransaction.builder()
                .type(MaterialTxType.INBOUND)
                .material(material)
                .qty(req.getQty())
                .unit(nullIfBlank(req.getUnit()))
                .targetLocation(whCode)
                .targetEquipment(null)
                .workerName(nullIfBlank(req.getWorkerName()))
                .build();

        MaterialTransaction saved = txRepo.save(tx);
        materialRepo.save(material);

        return toRes(saved);
    }

    // =========================
    // 불출 처리
    // =========================
    public MaterialTxResDto outbound(MaterialOutboundReqDto req) {

        validateCommon(req.getMaterialBarcode(), req.getQty());

        Material material = materialRepo.findByCode(req.getMaterialBarcode())
                .orElseThrow(() -> new CustomException("NOT_FOUND",
                        "해당 바코드의 자재가 존재하지 않습니다: " + req.getMaterialBarcode()));

        int currentStock = safeInt(material.getCurrentStock());
        if (currentStock < req.getQty()) {
            throw new CustomException("OUT_OF_STOCK", "재고가 부족합니다. 현재 재고: " + currentStock);
        }

        // 1) 재고 감소
        material.setCurrentStock(currentStock - req.getQty());

        // 2) 어느 창고에서 빠지는지 결정
        //    - req.targetLocation이 있으면 우선 사용
        //    - 없으면 마지막 INBOUND tx.targetLocation 사용
        String outWhCode = nullIfBlank(req.getTargetLocation());

        if (outWhCode == null) {
            MaterialTransaction lastInTx = txRepo
                    .findTop1ByMaterial_CodeAndTypeOrderByCreatedAtDesc(
                            material.getCode(),
                            MaterialTxType.INBOUND
                    )
                    .orElse(null);

            if (lastInTx != null) {
                outWhCode = nullIfBlank(lastInTx.getTargetLocation());
            }
        }

        // 3) 창고 occupancy 감소 (outWhCode가 있을 때만)
        if (outWhCode != null) {

            final String warehouseCode = outWhCode; // ✅ final로 고정

            Warehouse wh = warehouseRepo.findByCode(warehouseCode)
                    .orElseThrow(() -> new CustomException(
                            "NOT_FOUND",
                            "해당 창고(code)를 찾을 수 없습니다: " + warehouseCode
                    ));

            int occ = safeInt(wh.getOccupancy());
            int newOcc = occ - req.getQty();
            if (newOcc < 0) newOcc = 0;

            wh.setOccupancy(newOcc);
            wh.setStatus(calcWarehouseStatus(wh.getOccupancy(), wh.getCapacity()));
            warehouseRepo.save(wh);
        }

        // 4) 트랜잭션 생성 (불출은 설비가 핵심)
        MaterialTransaction tx = MaterialTransaction.builder()
                .type(MaterialTxType.OUTBOUND)
                .material(material)
                .qty(req.getQty())
                .unit(nullIfBlank(req.getUnit()))
                .targetLocation(outWhCode) // ✅ 불출에도 “빠진 창고” 기록 남김
                .targetEquipment(nullIfBlank(req.getTargetEquipment()))
                .workerName(nullIfBlank(req.getWorkerName()))
                .build();

        MaterialTransaction saved = txRepo.save(tx);
        materialRepo.save(material);

        return toRes(saved);
    }

    // =========================
    // 오늘 트랜잭션 로그 조회
    // =========================
    @Transactional(readOnly = true)
    public List<MaterialTxResDto> getTodayLogs() {

        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();

        return txRepo.findByCreatedAtBetweenOrderByCreatedAtDesc(start, end)
                .stream()
                .map(this::toRes)
                .collect(Collectors.toList());
    }

    // =========================
    // 유틸
    // =========================
    private void validateCommon(String barcode, Integer qty) {
        if (barcode == null || barcode.isBlank()) {
            throw new CustomException("BAD_REQUEST", "Material Barcode는 필수입니다.");
        }
        if (qty == null || qty <= 0) {
            throw new CustomException("BAD_REQUEST", "수량(qty)은 1 이상이어야 합니다.");
        }
    }

    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }

    private String nullIfBlank(String v) {
        if (v == null) return null;
        String t = v.trim();
        return t.isEmpty() ? null : t;
    }

    private WarehouseStatus calcWarehouseStatus(Integer occ, Integer cap) {
        int o = safeInt(occ);
        int c = safeInt(cap);
        if (c > 0 && o >= c) return WarehouseStatus.FULL;
        return WarehouseStatus.AVAILABLE;
    }

    private MaterialTxResDto toRes(MaterialTransaction tx) {
        return MaterialTxResDto.builder()
                .txId(tx.getId())
                .time(tx.getCreatedAt())
                .type(tx.getType())
                .materialName(tx.getMaterial().getName())
                .qty(tx.getQty())
                .unit(tx.getUnit())
                .targetLocation(tx.getTargetLocation())
                .targetEquipment(tx.getTargetEquipment())
                .workerName(tx.getWorkerName())
                .build();
    }
}
