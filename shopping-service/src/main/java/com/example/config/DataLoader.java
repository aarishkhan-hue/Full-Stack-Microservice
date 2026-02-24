package com.example.config;

import com.example.model.Inventory;
import com.example.repository.InventoryRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataLoader {

    private final InventoryRepository inventoryRepository;

    @PostConstruct
    public void loadData() {
        if (inventoryRepository.findBySkuCode("IPHONE_15").isEmpty()) {
            log.info("Seeding initial inventory for IPHONE_15");
            Inventory inventory = Inventory.builder()
                    .skuCode("IPHONE_15")
                    .quantity(100)
                    .build();
            inventoryRepository.save(inventory);
        }
    }
}
