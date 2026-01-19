package com.hm.mes_final_260106.mapper;

import com.hm.mes_final_260106.dto.DicingDto;
import com.hm.mes_final_260106.entity.Dicing;
import com.hm.mes_final_260106.entity.ProductionLog;
import com.hm.mes_final_260106.entity.WireBonding;
import com.hm.mes_final_260106.dto.WireBondingDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface WireBondingMapper {
    @Mapping(target = "productionLog", ignore = true)
    WireBonding toEntity(WireBondingDto dto);
}
