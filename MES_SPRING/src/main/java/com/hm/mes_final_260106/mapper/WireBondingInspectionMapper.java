package com.hm.mes_final_260106.mapper;

import com.hm.mes_final_260106.entity.WireBonding;
import com.hm.mes_final_260106.entity.WireBondingInspection;
import com.hm.mes_final_260106.dto.WireBondingInspectionDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface WireBondingInspectionMapper {

    @Mapping(target = "wireBonding", ignore = true)
    WireBondingInspection toEntity(WireBondingInspectionDto dto);
}