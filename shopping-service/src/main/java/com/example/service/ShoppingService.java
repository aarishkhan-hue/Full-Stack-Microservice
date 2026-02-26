package com.example.service;

import com.example.dto.OrderEvent;
import com.example.model.Inventory;
import com.example.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShoppingService {

    private final InventoryRepository inventoryRepository;
    private final RedissonClient redissonClient;

    @Async
    @Transactional
    @CacheEvict(value = { "inventoryList", "inventoryItem" }, allEntries = true)
    public void updateInventoryAsync(OrderEvent event) {
        String lockKey = "lock:inventory:" + event.getSkuCode();
        RLock lock = redissonClient.getLock(lockKey);

        try {
            // Attempt to acquire lock for 10 seconds, with 30s lease time
            if (lock.tryLock(10, 30, TimeUnit.SECONDS)) {
                log.info("Lock acquired for SKU {}. Updating inventory...", event.getSkuCode());

                inventoryRepository.findBySkuCode(event.getSkuCode())
                        .ifPresentOrElse(inventory -> {
                            if (inventory.getQuantity() >= event.getQuantity()) {
                                inventory.setQuantity(inventory.getQuantity() - event.getQuantity());
                                inventoryRepository.save(inventory);
                                log.info("Inventory updated for SKU {}. Remaining: {}",
                                        event.getSkuCode(), inventory.getQuantity());
                            } else {
                                log.warn("Insufficient quantity for SKU: {}", event.getSkuCode());
                            }
                        }, () -> log.error("SKU not found: {}", event.getSkuCode()));
            } else {
                log.error("Could not acquire lock for SKU: {} after 10s", event.getSkuCode());
            }
        } catch (InterruptedException e) {
            log.error("Interrupt during inventory lock acquisition for SKU: {}", event.getSkuCode());
            Thread.currentThread().interrupt();
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
                log.info("Lock released for SKU {}", event.getSkuCode());
            }
        }
    }
}
