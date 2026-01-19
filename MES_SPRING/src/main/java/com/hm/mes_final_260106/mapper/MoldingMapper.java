package com.hm.mes_final_260106.mapper;

import com.hm.mes_final_260106.dto.DicingDto;
import com.hm.mes_final_260106.entity.Dicing;
import com.hm.mes_final_260106.entity.Molding;
import com.hm.mes_final_260106.dto.MoldingDto;
import com.hm.mes_final_260106.entity.ProductionLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MoldingMapper {
    @Mapping(target = "productionLog", ignore = true)
    Molding toEntity(MoldingDto dto);
}
