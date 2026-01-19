package com.hm.mes_final_260106.mapper;

import com.hm.mes_final_260106.entity.DieBonding;
import com.hm.mes_final_260106.dto.DieBondingDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DieBondingMapper {
    DieBonding toEntity(DieBondingDto dto);
}
