package com.example.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
public class FallbackController {

    @GetMapping("/order-fallback")
    public Mono<String> orderServiceFallback() {
        return Mono.just("Order Service is currently unavailable. Please try again later.");
    }
}
