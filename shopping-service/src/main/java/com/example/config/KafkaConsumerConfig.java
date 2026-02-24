package com.example.config;

import com.example.dto.OrderEvent;
import com.example.service.ShoppingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.function.Consumer;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class KafkaConsumerConfig {

    private final ShoppingService shoppingService;

    @Bean
    public Consumer<OrderEvent> orderCreated() {
        return event -> {
            log.info("Received order event for inventory update: {}", event.getOrderNumber());
            shoppingService.updateInventoryAsync(event);
        };
    }
}
