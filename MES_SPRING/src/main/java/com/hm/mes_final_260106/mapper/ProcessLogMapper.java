package com.hm.mes_final_260106.mapper;

import com.hm.mes_final_260106.entity.ProcessLog;
import com.hm.mes_final_260106.dto.ProcessLogDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProcessLogMapper {
    ProcessLog toEntity(ProcessLogDto dto);
}