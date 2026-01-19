package com.hm.mes_final_260106.mapper;

import com.hm.mes_final_260106.entity.Dicing;
import com.hm.mes_final_260106.dto.DicingDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DicingMapper {
    Dicing toEntity(DicingDto dto);
}
