package com.example.controller;

import com.example.model.Inventory;
import com.example.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Slf4j
public class InventoryController {

    private final InventoryRepository inventoryRepository;

    @GetMapping
    public List<Inventory> getAllInventory() {
        log.info("Fetching all inventory items");
        return inventoryRepository.findAll();
    }

    @GetMapping("/{skuCode}")
    public Inventory getInventoryBySkuCode(@PathVariable String skuCode) {
        log.info("Fetching inventory for SKU: {}", skuCode);
        return inventoryRepository.findBySkuCode(skuCode)
                .orElseThrow(() -> new RuntimeException("SKU not found: " + skuCode));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Inventory addProduct(@RequestBody Inventory inventory) {
        log.info("Adding new product: {}", inventory.getSkuCode());
        return inventoryRepository.save(inventory);
    }

    @PutMapping("/{id}")
    public Inventory updateProduct(@PathVariable Long id, @RequestBody Inventory inventory) {
        log.info("Updating product ID: {}", id);
        Inventory existing = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found ID: " + id));

        existing.setSkuCode(inventory.getSkuCode());
        existing.setName(inventory.getName());
        existing.setDescription(inventory.getDescription());
        existing.setPrice(inventory.getPrice());
        existing.setOriginalPrice(inventory.getOriginalPrice());
        existing.setImageUrl(inventory.getImageUrl());
        existing.setCategory(inventory.getCategory());
        existing.setBrand(inventory.getBrand());
        existing.setRating(inventory.getRating());
        existing.setReviewCount(inventory.getReviewCount());
        existing.setQuantity(inventory.getQuantity());

        return inventoryRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Long id) {
        log.info("Deleting product ID: {}", id);
        inventoryRepository.deleteById(id);
    }
}
