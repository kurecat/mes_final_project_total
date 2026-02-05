package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.dto.Item.ItemCreateReqDto;
import com.hm.mes_final_260106.dto.Item.ItemUpdateReqDto;
import com.hm.mes_final_260106.dto.Item.ItemResDto;
import com.hm.mes_final_260106.entity.Item;
import com.hm.mes_final_260106.repository.ItemRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ItemService {

    private final ItemRepository itemRepository;

    // Create
    public ItemResDto createItem(ItemCreateReqDto dto) {
        Item item = new Item();
        item.setSerialNumber(dto.getSerialNumber());
        item.setInspectionResult(dto.getInspectionResult());

        Item saved = itemRepository.save(item);
        return toResDto(saved);
    }

    // Read (전체 조회)
    public List<ItemResDto> getAllItems() {
        return itemRepository.findAll()
                .stream()
                .map(this::toResDto)
                .collect(Collectors.toList());
    }

    // Read (단건 조회)
    public ItemResDto getItemById(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("물품을 찾을 수 없습니다"));
        return toResDto(item);
    }

    // Update
    public ItemResDto updateItem(Long id, ItemUpdateReqDto dto) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("물품을 찾을 수 없습니다"));

        item.setSerialNumber(dto.getSerialNumber());
        item.setInspectionResult(dto.getInspectionResult());
        item.setLocation(dto.getLocation());
        // productCode, productionLogId는 필요하다면 여기서 엔티티 조회 후 세팅

        Item updated = itemRepository.save(item);
        return toResDto(updated);
    }

    // Delete
    public void deleteItem(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("물품을 찾을 수 없습니다"));
        itemRepository.delete(item);
    }

    // Search by SerialNumber
    public List<ItemResDto> searchItemsBySerial(String serialNumber) {
        return itemRepository.findBySerialNumberContaining(serialNumber)
                .stream()
                .map(this::toResDto) // 엔티티 → DTO 변환
                .toList();
    }

    // Entity → DTO 변환 (매퍼 없이 직접)
    private ItemResDto toResDto(Item item) {
        return ItemResDto.builder()
                .id(item.getId())
                .serialNumber(item.getSerialNumber())
                .inspectionResult(item.getInspectionResult())
                .location(item.getLocation())
                .productCode(item.getProduct() != null ? item.getProduct().getCode() : null)
                .productionLogId(item.getProductionLog() != null ? item.getProductionLog().getId() : null)
                .build();
    }
}