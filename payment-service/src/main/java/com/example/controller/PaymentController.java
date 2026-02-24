package com.example.controller;

import com.example.model.Payment;
import com.example.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentRepository paymentRepository;

    @GetMapping("/{orderNumber}")
    public List<Payment> getPaymentStatus(@PathVariable String orderNumber) {
        // Returns list since multiple payment attempts might exist, though usually one
        return paymentRepository.findAll().stream()
                .filter(p -> p.getOrderNumber().equals(orderNumber))
                .toList();
    }
}
