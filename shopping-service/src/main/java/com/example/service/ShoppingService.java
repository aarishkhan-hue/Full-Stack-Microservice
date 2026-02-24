package com.example.service;

import com.example.dto.OrderEvent;
import com.example.model.Inventory;
import com.example.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.function.Consumer;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShoppingService {

    private final InventoryRepository inventoryRepository;

    @Async
    @Transactional
    public void updateInventoryAsync(OrderEvent event) {
        log.info("Updating inventory asynchronously for SKU {} on thread: {}",
                event.getSkuCode(), Thread.currentThread().getName());

        inventoryRepository.findBySkuCode(event.getSkuCode())
                .ifPresentOrElse(inventory -> {
                    if (inventory.getQuantity() >= event.getQuantity()) {
                        inventory.setQuantity(inventory.getQuantity() - event.getQuantity());
                        inventoryRepository.save(inventory);
                        log.info("Inventory updated for SKU {}. Remaining: {}",
                                event.getSkuCode(), inventory.getQuantity());
                    } else {
                        log.warn("Insufficient quantity for SKU: {}", event.getSkuCode());
                        // In a real system, would trigger Compensating Transaction / Saga
                    }
                }, () -> log.error("SKU not found in inventory: {}", event.getSkuCode()));
    }
}
