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

    @GetMapping("/all")
    public ResponseEntity<List<com.sg.gamestopbackend.dto.AdminOrderDto>> getAllOrdersForAdmin() {
        return ResponseEntity.ok(orderService.getAllOrdersForAdmin());
    }

    @GetMapping("/details/{orderId}")
    public ResponseEntity<com.sg.gamestopbackend.dto.AdminOrderDto> getOrderDetailsForAdmin(
            @PathVariable String orderId) {

        return ResponseEntity.ok(orderService.getOrderDetailsForAdmin(orderId));
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<com.sg.gamestopbackend.dto.AdminOrderDto> updateOrderStatus(
            @PathVariable String orderId,
            @RequestBody java.util.Map<String, String> payload) {

        String newStatus = payload.get("status");
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, newStatus));
    }
}
