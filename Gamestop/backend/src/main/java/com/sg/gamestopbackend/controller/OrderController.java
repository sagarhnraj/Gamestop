package com.sg.gamestopbackend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sg.gamestopbackend.dto.PaymentOrderResponse;
import com.sg.gamestopbackend.dto.PaymentVerificationRequest;
import com.sg.gamestopbackend.entity.Order;
import com.sg.gamestopbackend.service.OrderService;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/{userId}/create-payment")
    public ResponseEntity<PaymentOrderResponse> createPayment(
            @PathVariable Integer userId) {

        return ResponseEntity.ok(
                orderService.createPaymentOrder(userId));
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<Order> verifyPayment(
            @RequestBody PaymentVerificationRequest request) {

        return ResponseEntity.ok(
                orderService.confirmPayment(request));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Order>> getOrders(
            @PathVariable Integer userId) {

        return ResponseEntity.ok(
                orderService.getOrders(userId));
    }
}
