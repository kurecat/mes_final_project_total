package com.hm.mes_final_260106.mapper;

import com.hm.mes_final_260106.entity.DicingInspection;
import com.hm.mes_final_260106.dto.DicingInspectionDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DicingInspectionMapper {
    DicingInspection toEntity(DicingInspectionDto dto);
}
