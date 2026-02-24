package com.example.service;

import com.example.dto.OrderEvent;
import com.example.model.Order;
import com.example.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final StreamBridge streamBridge;

    @Transactional
    public String placeOrder(Order orderRequest) {
        log.info("Placing order for SKU: {}", orderRequest.getSkuCode());
        
        Order order = Order.builder()
                .orderNumber(UUID.randomUUID().toString())
                .skuCode(orderRequest.getSkuCode())
                .price(orderRequest.getPrice())
                .quantity(orderRequest.getQuantity())
                .status("PENDING")
                .orderTime(LocalDateTime.now())
                .build();

        orderRepository.save(order);
        log.info("Order saved with ID: {}", order.getId());

        // Publish event to Kafka asynchronously
        OrderEvent orderEvent = new OrderEvent(
                order.getOrderNumber(),
                order.getSkuCode(),
                order.getQuantity(),
                order.getStatus()
        );
        
        boolean sent = streamBridge.send("orderCreated-out-0", orderEvent);
        if (sent) {
            log.info("Order event sent to Kafka for order: {}", order.getOrderNumber());
        } else {
            log.error("Failed to send order event to Kafka");
        }

        return "Order Placed Successfully. Order Number: " + order.getOrderNumber();
    }
}
