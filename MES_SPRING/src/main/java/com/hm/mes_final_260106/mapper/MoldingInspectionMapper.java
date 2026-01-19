package com.hm.mes_final_260106.mapper;

import com.hm.mes_final_260106.entity.MoldingInspection;
import com.hm.mes_final_260106.dto.MoldingInspectionDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MoldingInspectionMapper {
    MoldingInspection toEntity(MoldingInspectionDto dto);
}
