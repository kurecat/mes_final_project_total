package com.hm.mes_final_260106.service;

import com.hm.mes_final_260106.entity.Item;
import com.hm.mes_final_260106.repository.ItemRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;

    // Create
    public Item createItem(Item item) {
        return itemRepository.save(item);
    }

    // Read (전체 조회)
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    // Read (단건 조회)
    public Item getItemById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("물품을 찾을 수 없습니다"));
    }

    // Update
    public Item updateItem(Long id, Item updatedItem) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("물품을 찾을 수 없습니다"));

        item.setSerialNumber(updatedItem.getSerialNumber());
        item.setProduct(updatedItem.getProduct());
        item.setProductionLog(updatedItem.getProductionLog());
        item.setInspectionResult(updatedItem.getInspectionResult());
        item.setLocation(updatedItem.getLocation());

        return itemRepository.save(item);
    }

    // Delete
    public void deleteItem(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("물품을 찾을 수 없습니다"));
        itemRepository.delete(item);
    }
}