package com.hm.mes_final_260106.mapper;

import com.hm.mes_final_260106.entity.Dicing;
import com.hm.mes_final_260106.entity.DicingInspection;
import com.hm.mes_final_260106.dto.DicingInspectionDto;
import com.hm.mes_final_260106.entity.ProductionLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DicingInspectionMapper {

    @Mapping(target = "dicing", ignore = true)
    DicingInspection toEntity(DicingInspectionDto dto);
}
