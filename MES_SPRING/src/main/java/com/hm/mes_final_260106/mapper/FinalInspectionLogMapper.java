package com.hm.mes_final_260106.mapper;

import com.hm.mes_final_260106.entity.FinalInspection;
import com.hm.mes_final_260106.dto.FinalInspectionDto;
import com.hm.mes_final_260106.entity.Item;
import com.hm.mes_final_260106.entity.ProductionLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FinalInspectionLogMapper {

    @Mapping(target = "productionLog", ignore = true)
    @Mapping(target = "item", ignore = true)
    FinalInspection toEntity(FinalInspectionDto dto);
}
