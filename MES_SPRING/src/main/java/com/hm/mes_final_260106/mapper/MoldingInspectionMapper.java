package com.hm.mes_final_260106.mapper;

import com.hm.mes_final_260106.entity.MoldingInspection;
import com.hm.mes_final_260106.entity.Molding;
import com.hm.mes_final_260106.dto.MoldingInspectionDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MoldingInspectionMapper {

    @Mapping(target = "molding", ignore = true)
    MoldingInspection toEntity(MoldingInspectionDto dto);
}