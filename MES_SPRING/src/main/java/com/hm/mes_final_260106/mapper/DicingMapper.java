package com.hm.mes_final_260106.mapper;

import com.hm.mes_final_260106.entity.Dicing;
import com.hm.mes_final_260106.dto.DicingDto;
import com.hm.mes_final_260106.entity.ProductionLog;
import com.hm.mes_final_260106.entity.WireBonding;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring")
public interface DicingMapper {

    @Mapping(target = "productionLog", ignore = true)
    Dicing toEntity(DicingDto dto);
}
