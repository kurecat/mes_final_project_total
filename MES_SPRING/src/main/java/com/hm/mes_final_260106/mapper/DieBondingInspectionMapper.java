package com.hm.mes_final_260106.mapper;

import com.hm.mes_final_260106.dto.DicingInspectionDto;
import com.hm.mes_final_260106.dto.DieBondingDto;
import com.hm.mes_final_260106.entity.Dicing;
import com.hm.mes_final_260106.entity.DicingInspection;
import com.hm.mes_final_260106.entity.DieBonding;
import com.hm.mes_final_260106.entity.DieBondingInspection;
import com.hm.mes_final_260106.dto.DieBondingInspectionDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DieBondingInspectionMapper {

    @Mapping(target = "dieBonding", ignore = true)
    DieBondingInspection toEntity(DieBondingInspectionDto dto);
}
