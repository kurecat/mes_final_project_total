package com.hm.mes_final_260106.mapper;

import com.hm.mes_final_260106.entity.WireBonding;
import com.hm.mes_final_260106.dto.WireBondingDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface WireBondingMapper {
    WireBonding toEntity(WireBondingDto dto);
}
