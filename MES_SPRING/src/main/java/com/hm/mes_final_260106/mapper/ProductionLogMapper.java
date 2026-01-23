package com.hm.mes_final_260106.mapper;

import com.hm.mes_final_260106.dto.DicingInspectionDto;
import com.hm.mes_final_260106.dto.ProductionReportDto;
import com.hm.mes_final_260106.entity.DicingInspection;
import com.hm.mes_final_260106.entity.ProductionLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductionLogMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "workOrder", ignore = true)
    @Mapping(target = "member", ignore = true)
    @Mapping(target = "equipment", ignore = true)
    ProductionLog toEntity(ProductionReportDto dto);
}
