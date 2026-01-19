package com.hm.mes_final_260106.mapper;

import com.hm.mes_final_260106.entity.Molding;
import com.hm.mes_final_260106.dto.MoldingDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MoldingMapper {
    Molding toEntity(MoldingDto dto);
}
