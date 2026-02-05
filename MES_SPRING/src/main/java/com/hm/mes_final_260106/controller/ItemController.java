package com.hm.mes_final_260106.controller;

import com.hm.mes_final_260106.dto.Item.ItemCreateReqDto;
import com.hm.mes_final_260106.dto.Item.ItemUpdateReqDto;
import com.hm.mes_final_260106.dto.Item.ItemResDto;
import com.hm.mes_final_260106.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mes/item")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ItemController {

    private final ItemService itemService;

    // Create
    @PostMapping
    public ResponseEntity<ItemResDto> createItem(@RequestBody ItemCreateReqDto dto) {
        return ResponseEntity.ok(itemService.createItem(dto));
    }

    // Read (전체 조회)
    @GetMapping("/list")
    public ResponseEntity<List<ItemResDto>> getAllItems() {
        return ResponseEntity.ok(itemService.getAllItems());
    }

    // Read (단건 조회)
    @GetMapping("/{id}")
    public ResponseEntity<ItemResDto> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.getItemById(id));
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<ItemResDto> updateItem(@PathVariable Long id, @RequestBody ItemUpdateReqDto dto) {
        return ResponseEntity.ok(itemService.updateItem(id, dto));
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    // Search (시리얼 번호 검색)
    @GetMapping("/search")
    public ResponseEntity<List<ItemResDto>> searchItems(@RequestParam String serialNumber) {
        return ResponseEntity.ok(itemService.searchItemsBySerial(serialNumber));
    }
}