package com.hm.mes_final_260106.mapper;

import com.hm.mes_final_260106.entity.FinalInspectionLog;
import com.hm.mes_final_260106.dto.FinalInspectionLogDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FinalInspectionLogMapper {
    FinalInspectionLog toEntity(FinalInspectionLogDto dto);
}
