package com.example.service;

import com.example.dto.OrderEvent;
import com.example.model.Payment;
import com.example.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.function.Consumer;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;

    @Async
    public void processPaymentAsync(OrderEvent event) {
        log.info("Processing payment asynchronously for order {} on thread: {}",
                event.getOrderNumber(), Thread.currentThread().getName());

        // Simulating some processing time
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        Payment payment = Payment.builder()
                .orderNumber(event.getOrderNumber())
                .amount(BigDecimal.valueOf(100.0)) // Simulation
                .paymentStatus("SUCCESS")
                .transactionTime(LocalDateTime.now())
                .build();

        paymentRepository.save(payment);
        log.info("Payment saved for order: {}", event.getOrderNumber());
    }
}
