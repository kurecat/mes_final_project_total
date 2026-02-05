package com.hm.mes_final_260106.mapper;

import com.hm.mes_final_260106.dto.*;
import com.hm.mes_final_260106.dto.Item.ItemResDto;
import com.hm.mes_final_260106.dto.lot.LotResDto;
import com.hm.mes_final_260106.dto.productionLog.ProductionLogCreateReqDto;
import com.hm.mes_final_260106.dto.productionLog.ProductionLogResDto;
import com.hm.mes_final_260106.entity.*;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProductionLogMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "workOrder", ignore = true)
    @Mapping(target = "worker", ignore = true)
    @Mapping(target = "equipment", ignore = true)
    ProductionLog toEntity(ProductionLogCreateReqDto dto);

    // 공정 엔티티
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "productionLog", source = "productionLog")
    Dicing toEntity(DicingDto dto, ProductionLog productionLog);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "productionLog", source = "productionLog")
    DicingInspection toEntity(DicingInspectionDto dto, ProductionLog productionLog);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "productionLog", source = "productionLog")
    DieBonding toEntity(DieBondingDto dto, ProductionLog productionLog);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "productionLog", source = "productionLog")
    DieBondingInspection toEntity(DieBondingInspectionDto dto, ProductionLog productionLog);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "productionLog", source = "productionLog")
    WireBonding toEntity(WireBondingDto dto, ProductionLog productionLog);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "productionLog", source = "productionLog")
    WireBondingInspection toEntity(WireBondingInspectionDto dto, ProductionLog productionLog);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "productionLog", source = "productionLog")
    Molding toEntity(MoldingDto dto, ProductionLog productionLog);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "productionLog", source = "productionLog")
    MoldingInspection toEntity(MoldingInspectionDto dto, ProductionLog productionLog);

    // Item
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "productionLog", source = "productionLog")
    @Mapping(target = "product", source = "product")
    Item toEntity(ItemResDto dto, ProductionLog productionLog, Product product);

    // FinalInspection
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "productionLog", source = "productionLog")
    @Mapping(target = "item", source = "item")
    FinalInspection toEntity(FinalInspectionDto dto, ProductionLog productionLog, Item item);

    // LotMapping 추가
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "productionLog", source = "productionLog")
    @Mapping(target = "lot", source = "lot")
    LotMapping toEntity(ProductionLog productionLog, Lot lot);

    // LotMapping → LotResDto
    @Mapping(target = "id", source = "lot.id")
    @Mapping(target = "code", source = "lot.code")
    @Mapping(target = "materialCode", source = "lot.material.code")
    @Mapping(target = "status", source = "lot.status")
    @Mapping(target = "currentQty", source = "lot.material.currentStock")
    @Mapping(target = "location", source = "lot.location")
    LotResDto toLotResDto(LotMapping lotMapping);

    List<LotResDto> toLotResDtoList(List<LotMapping> lotMappings);

    // ProductionLog → ProductionLogResDto
    @Mapping(target = "workOrderNumber", source = "workOrder.workOrderNumber")
    @Mapping(target = "workerCode", source = "worker.code")
    @Mapping(target = "equipmentCode", source = "equipment.code")
    @Mapping(target = "dicingDto", source = "dicing")
    @Mapping(target = "dicingInspectionDto", source = "dicingInspection")
    @Mapping(target = "dieBondingDto", source = "dieBonding")
    @Mapping(target = "dieBondingInspectionDto", source = "dieBondingInspection")
    @Mapping(target = "wireBondingDto", source = "wireBonding")
    @Mapping(target = "wireBondingInspectionDto", source = "wireBondingInspection")
    @Mapping(target = "moldingDto", source = "molding")
    @Mapping(target = "moldingInspectionDto", source = "moldingInspection")
    @Mapping(target = "itemDtos", source = "items")
    @Mapping(target = "finalInspectionDtos", source = "finalInspections")
    @Mapping(target = "inputLots", source = "lotMappings")
    ProductionLogResDto toResDto(ProductionLog productionLog);

    List<ProductionLogResDto> toResDtoList(List<ProductionLog> productionLogs);

}