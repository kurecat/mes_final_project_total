package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.dto.*;
import com.hm.mes_final_260106.entity.Material;
import com.hm.mes_final_260106.entity.MaterialTransaction;
import com.hm.mes_final_260106.constant.MaterialTxType;
import com.hm.mes_final_260106.exception.CustomException;
import com.hm.mes_final_260106.repository.MaterialRepository;
import com.hm.mes_final_260106.repository.MaterialTransactionRepository;
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

    // =========================
    // 입고 처리
    // =========================
    public MaterialTxResDto inbound(MaterialInboundReqDto req) {

        validateCommon(req.getMaterialBarcode(), req.getQty());

        Material material = materialRepo.findByCode(req.getMaterialBarcode())
                .orElseThrow(() -> new CustomException("NOT_FOUND", "해당 바코드의 자재가 존재하지 않습니다: " + req.getMaterialBarcode()));

        // 재고 증가
        int currentStock = safeInt(material.getCurrentStock());
        material.setCurrentStock(currentStock + req.getQty());

        MaterialTransaction tx = MaterialTransaction.builder()
                .type(MaterialTxType.INBOUND)
                .material(material)
                .qty(req.getQty())
                .unit(req.getUnit())
                .targetLocation(req.getTargetLocation())
                .targetEquipment(null)
                .workerName(req.getWorkerName())
                .build();

        MaterialTransaction saved = txRepo.save(tx);
        return toRes(saved);
    }

    // =========================
    // 불출 처리
    // =========================
    public MaterialTxResDto outbound(MaterialOutboundReqDto req) {

        validateCommon(req.getMaterialBarcode(), req.getQty());

        Material material = materialRepo.findByCode(req.getMaterialBarcode())
                .orElseThrow(() -> new CustomException("NOT_FOUND", "해당 바코드의 자재가 존재하지 않습니다: " + req.getMaterialBarcode()));

        int currentStock = safeInt(material.getCurrentStock());

        if (currentStock < req.getQty()) {
            throw new CustomException("OUT_OF_STOCK", "재고가 부족합니다. 현재 재고: " + currentStock);
        }

        // 재고 감소
        material.setCurrentStock(currentStock - req.getQty());

        MaterialTransaction tx = MaterialTransaction.builder()
                .type(MaterialTxType.OUTBOUND)
                .material(material)
                .qty(req.getQty())
                .unit(req.getUnit())
                .targetLocation(req.getTargetLocation())
                .targetEquipment(req.getTargetEquipment())
                .workerName(req.getWorkerName())
                .build();

        MaterialTransaction saved = txRepo.save(tx);
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
    //1111111111
}
