package com.hm.mes_final_260106.mapper;

import com.hm.mes_final_260106.dto.*;
import com.hm.mes_final_260106.entity.*;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class Mapper {

    private final DicingMapper dicingMapper;
    private final DicingInspectionMapper dicingInspectionMapper;
    private final DieBondingMapper dieBondingMapper;
    private final DieBondingInspectionMapper dieBondingInspectionMapper;
    private final WireBondingMapper wireBondingMapper;
    private final WireBondingInspectionMapper wireBondingInspectionMapper;
    private final MoldingMapper moldingMapper;
    private final MoldingInspectionMapper moldingInspectionMapper;
    private final ItemMapper itemMapper;
    private final FinalInspectionMapper finalInspectionMapper;
    private final ProductionLogMapper productionLogMapper;

    public Dicing toEntity(DicingDto dto) {
        return dicingMapper.toEntity(dto);
    }

    public DicingInspection toEntity(DicingInspectionDto dto) {
        return dicingInspectionMapper.toEntity(dto);
    }

    public DieBonding toEntity(DieBondingDto dto) {
        return dieBondingMapper.toEntity(dto);
    }

    public DieBondingInspection toEntity(DieBondingInspectionDto dto) {
        return dieBondingInspectionMapper.toEntity(dto);
    }

    public WireBonding toEntity(WireBondingDto dto) {
        return wireBondingMapper.toEntity(dto);
    }

    public WireBondingInspection toEntity(WireBondingInspectionDto dto) {
        return wireBondingInspectionMapper.toEntity(dto);
    }

    public Molding toEntity(MoldingDto dto) {
        return moldingMapper.toEntity(dto);
    }

    public MoldingInspection toEntity(MoldingInspectionDto dto) {
        return moldingInspectionMapper.toEntity(dto);
    }

    public Item toEntity(ItemDto dto) { return itemMapper.toEntity(dto); }

    public FinalInspection toEntity(FinalInspectionDto dto) {
        return finalInspectionMapper.toEntity(dto);
    }

    public ProductionLog toEntity(ProductionReportDto dto) {return productionLogMapper.toEntity(dto);}
}