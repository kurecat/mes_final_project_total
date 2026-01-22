package com.hm.mes_final_260106.mapper;

import com.hm.mes_final_260106.dto.FinalInspectionDto;
import com.hm.mes_final_260106.dto.ItemDto;
import com.hm.mes_final_260106.entity.FinalInspection;
import com.hm.mes_final_260106.entity.Item;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ItemMapper {

    @Mapping(target = "product", ignore = true)
    @Mapping(target = "productionLog", ignore = true)
    Item toEntity(ItemDto dto);
}
