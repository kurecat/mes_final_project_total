package com.hm.mes_final_260106.mapper;

import com.hm.mes_final_260106.entity.*;
import org.springframework.stereotype.Component;

@Component
public class Mapper {

    private final DicingMapper dicingMapper;
    private final DicingInspectionMapper dicingInspectionMapper;
    private final DieBondingMapper dieBondingMapper;
    private final DieBondingInspectionMapper dieBondingInspectionMapper;
    private final WireBondingMapper wireBondingMapper;
    private final WireBondingInspectionMapper wireBondingInspectionMapper;
    private final MoldingMapper moldingMapper;
    private final MoldingInspectionMapper moldingInspectionMapper;
    private final ProcessLogMapper processLogMapper;
    private final FinalInspectionLogMapper finalInspectionLogMapper;

    public Mapper(
            DicingMapper dicingMapper,
            DicingInspectionMapper dicingInspectionMapper,
            DieBondingMapper dieBondingMapper,
            DieBondingInspectionMapper dieBondingInspectionMapper,
            WireBondingMapper wireBondingMapper,
            WireBondingInspectionMapper wireBondingInspectionMapper,
            MoldingMapper moldingMapper,
            MoldingInspectionMapper moldingInspectionMapper,
            ProcessLogMapper processLogMapper,
            FinalInspectionLogMapper finalInspectionLogMapper
    ) {
        this.dicingMapper = dicingMapper;
        this.dicingInspectionMapper = dicingInspectionMapper;
        this.dieBondingMapper = dieBondingMapper;
        this.dieBondingInspectionMapper = dieBondingInspectionMapper;
        this.wireBondingMapper = wireBondingMapper;
        this.wireBondingInspectionMapper = wireBondingInspectionMapper;
        this.moldingMapper = moldingMapper;
        this.moldingInspectionMapper = moldingInspectionMapper;
        this.processLogMapper = processLogMapper;
        this.finalInspectionLogMapper = finalInspectionLogMapper;
    }

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

    public ProcessLog toEntity(ProcessLogDto dto) {
        return processLogMapper.toEntity(dto);
    }

    public FinalInspectionLog toEntity(FinalInspectionLogDto dto) {
        return finalInspectionLogMapper.toEntity(dto);
    }
}