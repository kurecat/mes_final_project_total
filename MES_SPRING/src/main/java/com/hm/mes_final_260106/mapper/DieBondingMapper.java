package com.hm.mes_final_260106.mapper;

import com.hm.mes_final_260106.dto.DicingDto;
import com.hm.mes_final_260106.entity.Dicing;
import com.hm.mes_final_260106.entity.DieBonding;
import com.hm.mes_final_260106.dto.DieBondingDto;
import com.hm.mes_final_260106.entity.ProductionLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DieBondingMapper {
    @Mapping(target = "productionLog", ignore = true)
    DieBonding toEntity(DieBondingDto dto);
}
