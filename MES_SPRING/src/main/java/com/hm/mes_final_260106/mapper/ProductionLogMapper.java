package com.hm.mes_final_260106.mapper;

import com.hm.mes_final_260106.dto.*;
import com.hm.mes_final_260106.dto.Item.ItemResDto;
import com.hm.mes_final_260106.entity.*;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProductionLogMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "workOrder", ignore = true)
    @Mapping(target = "worker", ignore = true)
    @Mapping(target = "equipment", ignore = true)
    ProductionLog toEntity(ProductionLogDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "productionLog", source = "productionLog")
    Dicing toEntity(DicingDto dto, ProductionLog productionLog);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dicing", source = "dicing")
    DicingInspection toEntity(DicingInspectionDto dto, Dicing dicing);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "productionLog", source = "productionLog")
    DieBonding toEntity(DieBondingDto dto, ProductionLog productionLog);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dieBonding", source = "dieBonding")
    DieBondingInspection toEntity(DieBondingInspectionDto dto, DieBonding dieBonding);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "productionLog", source = "productionLog")
    WireBonding toEntity(WireBondingDto dto, ProductionLog productionLog);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "wireBonding", source = "wireBonding")
    WireBondingInspection toEntity(WireBondingInspectionDto dto, WireBonding wireBonding);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "productionLog", source = "productionLog")
    Molding toEntity(MoldingDto dto, ProductionLog productionLog);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "molding", source = "molding")
    MoldingInspection toEntity(MoldingInspectionDto dto, Molding molding);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "productionLog", source = "productionLog")
    @Mapping(target = "product", source = "product")
    Item toEntity(ItemResDto dto, ProductionLog productionLog, Product product);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "productionLog", source = "productionLog")
    @Mapping(target = "item", source = "item")
    FinalInspection toEntity(FinalInspectionDto dto, ProductionLog productionLog, Item item);

}