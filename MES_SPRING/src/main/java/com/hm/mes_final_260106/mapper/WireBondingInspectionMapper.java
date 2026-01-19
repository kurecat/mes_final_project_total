package com.hm.mes_final_260106.mapper;

import com.hm.mes_final_260106.entity.WireBondingInspection;
import com.hm.mes_final_260106.dto.WireBondingInspectionDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface WireBondingInspectionMapper {
    WireBondingInspection toEntity(WireBondingInspectionDto dto);
}
