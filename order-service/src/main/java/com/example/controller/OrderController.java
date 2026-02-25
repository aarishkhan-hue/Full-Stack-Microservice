package com.example.controller;

import com.example.model.Order;
import com.example.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final com.example.repository.OrderRepository orderRepository;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public String placeOrder(@RequestBody Order order) {
        return orderService.placeOrder(order);
    }

    @GetMapping("/analytics/sales")
    public Map<String, Long> getSalesAnalytics(@RequestParam String period) {
        LocalDateTime time = switch (period.toLowerCase()) {
            case "week" -> LocalDateTime.now().minusWeeks(1);
            case "month" -> LocalDateTime.now().minusMonths(1);
            case "year" -> LocalDateTime.now().minusYears(1);
            default -> LocalDateTime.now().minusDays(1);
        };
        return Map.of("count", orderRepository.sumQuantitySince(time));
    }
}
