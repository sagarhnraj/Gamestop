package com.sg.gamestopbackend.service;

import java.util.List;

import com.sg.gamestopbackend.dto.PaymentOrderResponse;
import com.sg.gamestopbackend.dto.PaymentVerificationRequest;
import com.sg.gamestopbackend.entity.Order;

public interface OrderService {

    PaymentOrderResponse createPaymentOrder(Integer userId);

    Order confirmPayment(PaymentVerificationRequest request);

    List<Order> getOrders(Integer userId);

    List<com.sg.gamestopbackend.dto.AdminOrderDto> getAllOrdersForAdmin();

    com.sg.gamestopbackend.dto.AdminOrderDto getOrderDetailsForAdmin(String orderId);

    com.sg.gamestopbackend.dto.AdminOrderDto updateOrderStatus(String orderId, String newStatus);
}
