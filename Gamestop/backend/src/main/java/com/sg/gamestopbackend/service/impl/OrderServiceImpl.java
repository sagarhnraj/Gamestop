package com.sg.gamestopbackend.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.sg.gamestopbackend.dto.PaymentOrderResponse;
import com.sg.gamestopbackend.dto.PaymentVerificationRequest;
import com.sg.gamestopbackend.entity.CartItem;
import com.sg.gamestopbackend.entity.Order;
import com.sg.gamestopbackend.entity.OrderItem;
import com.sg.gamestopbackend.entity.Product;
import com.sg.gamestopbackend.entity.User;
import com.sg.gamestopbackend.exception.ResourceNotFoundException;
import com.sg.gamestopbackend.repository.CartItemRepository;
import com.sg.gamestopbackend.repository.OrderRepository;
import com.sg.gamestopbackend.repository.UserRepository;
import com.sg.gamestopbackend.service.OrderService;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Value("${razorpay.currency}")
    private String currency;

    public OrderServiceImpl(
            OrderRepository orderRepository,
            CartItemRepository cartItemRepository,
            UserRepository userRepository,
            RazorpayClient razorpayClient) {

        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.razorpayClient = razorpayClient;
    }

    @Override
    @Transactional
    public PaymentOrderResponse createPaymentOrder(Integer userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        List<CartItem> cartItems =
                cartItemRepository.findByUser_UserId(userId);

        if (cartItems.isEmpty()) {
            throw new ResourceNotFoundException("Cart is empty");
        }

        Order order = new Order();
        order.setOrderId(UUID.randomUUID().toString());
        order.setUser(user);
        order.setStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now());

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {

            Product product = cartItem.getProduct();
            Integer quantity = cartItem.getQuantity();

            BigDecimal pricePerUnit = product.getPrice();
            BigDecimal totalPrice =
                    pricePerUnit.multiply(BigDecimal.valueOf(quantity));

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(quantity);
            orderItem.setPricePerUnit(pricePerUnit);
            orderItem.setTotalPrice(totalPrice);
            orderItem.setOrderItemsCol(truncate(product.getName()));

            order.addItem(orderItem);

            totalAmount = totalAmount.add(totalPrice);
        }

        order.setTotalAmount(totalAmount);

        long amountInPaise = totalAmount
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValue();

        String razorpayOrderId = createRazorpayOrder(
                amountInPaise,
                order.getOrderId());

        order.setRazorpayOrderId(razorpayOrderId);

        orderRepository.save(order);

        return new PaymentOrderResponse(
                order.getOrderId(),
                razorpayOrderId,
                amountInPaise,
                currency,
                razorpayKeyId);
    }

    @Override
    @Transactional
    public Order confirmPayment(PaymentVerificationRequest request) {

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Order not found"));

        boolean valid = verifySignature(request);

        if (!valid) {
            order.setStatus("FAILED");
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);
            throw new IllegalArgumentException(
                    "Payment verification failed");
        }

        order.setStatus("SUCCESS");
        order.setRazorpayPaymentId(request.getRazorpayPaymentId());
        order.setUpdatedAt(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);

        cartItemRepository.deleteByUser_UserId(
                order.getUser().getUserId());

        return savedOrder;
    }

    @Override
    public List<Order> getOrders(Integer userId) {
        return orderRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);
    }

    private String createRazorpayOrder(long amountInPaise, String receipt) {

        try {

            JSONObject options = new JSONObject();
            options.put("amount", amountInPaise);
            options.put("currency", currency);
            options.put("receipt", receipt);

            com.razorpay.Order razorpayOrder =
                    razorpayClient.orders.create(options);

            return razorpayOrder.get("id");

        } catch (RazorpayException e) {
            throw new IllegalStateException(
                    "Failed to create Razorpay order: " + e.getMessage());
        }
    }

    private boolean verifySignature(PaymentVerificationRequest request) {

        try {

            JSONObject attributes = new JSONObject();
            attributes.put(
                    "razorpay_order_id",
                    request.getRazorpayOrderId());
            attributes.put(
                    "razorpay_payment_id",
                    request.getRazorpayPaymentId());
            attributes.put(
                    "razorpay_signature",
                    request.getRazorpaySignature());

            return Utils.verifyPaymentSignature(
                    attributes,
                    razorpayKeySecret);

        } catch (RazorpayException e) {
            return false;
        }
    }

    @Override
    public List<com.sg.gamestopbackend.dto.AdminOrderDto> getAllOrdersForAdmin() {
        return orderRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::mapToAdminDto)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public com.sg.gamestopbackend.dto.AdminOrderDto getOrderDetailsForAdmin(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        return mapToAdminDto(order);
    }

    @Override
    @Transactional
    public com.sg.gamestopbackend.dto.AdminOrderDto updateOrderStatus(String orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (newStatus == null || newStatus.trim().isEmpty()) {
            throw new IllegalArgumentException("Order status cannot be empty.");
        }

        String normalizedStatus = newStatus.trim().toUpperCase();
        order.setStatus(normalizedStatus);
        order.setUpdatedAt(LocalDateTime.now());

        Order updatedOrder = orderRepository.save(order);
        return mapToAdminDto(updatedOrder);
    }

    private com.sg.gamestopbackend.dto.AdminOrderDto mapToAdminDto(Order order) {
        com.sg.gamestopbackend.dto.AdminOrderDto dto = new com.sg.gamestopbackend.dto.AdminOrderDto();
        dto.setOrderId(order.getOrderId());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setRazorpayOrderId(order.getRazorpayOrderId());
        dto.setRazorpayPaymentId(order.getRazorpayPaymentId());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        String statusUpper = (order.getStatus() != null) ? order.getStatus().toUpperCase() : "";
        if ("SUCCESS".equals(statusUpper) || "CONFIRMED".equals(statusUpper) || "SHIPPED".equals(statusUpper) || "DELIVERED".equals(statusUpper) || order.getRazorpayPaymentId() != null) {
            dto.setPaymentStatus("PAID");
        } else if ("FAILED".equals(statusUpper) || "CANCELLED".equals(statusUpper)) {
            dto.setPaymentStatus("CANCELLED");
        } else {
            dto.setPaymentStatus("PENDING");
        }

        if (order.getRazorpayPaymentId() != null && !order.getRazorpayPaymentId().trim().isEmpty()) {
            dto.setPaymentMethod("Razorpay Online (UPI/Card)");
        } else {
            dto.setPaymentMethod("Online Payment");
        }

        dto.setShippingAddress("Standard Shipping Address");

        if (order.getUser() != null) {
            dto.setUserId(order.getUser().getUserId());
            dto.setCustomerName(order.getUser().getUsername() != null ? order.getUser().getUsername() : "Customer");
            dto.setCustomerEmail(order.getUser().getEmail());
        } else {
            dto.setCustomerName("Guest Customer");
            dto.setCustomerEmail("N/A");
        }

        List<com.sg.gamestopbackend.dto.AdminOrderItemDto> itemDtos = new java.util.ArrayList<>();
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                com.sg.gamestopbackend.dto.AdminOrderItemDto itemDto = new com.sg.gamestopbackend.dto.AdminOrderItemDto();
                itemDto.setOrderItemId(item.getId());
                itemDto.setQuantity(item.getQuantity());
                itemDto.setPricePerUnit(item.getPricePerUnit());
                itemDto.setTotalPrice(item.getTotalPrice());

                if (item.getProduct() != null) {
                    itemDto.setProductId(item.getProduct().getProductId());
                    itemDto.setProductName(item.getProduct().getName());
                    itemDto.setProductImage(item.getProduct().getImage());
                } else {
                    itemDto.setProductName(item.getOrderItemsCol() != null ? item.getOrderItemsCol() : "Product");
                }
                itemDtos.add(itemDto);
            }
        }
        dto.setItems(itemDtos);

        return dto;
    }

    private String truncate(String name) {
        if (name == null) {
            return "item";
        }
        return name.length() > 45 ? name.substring(0, 45) : name;
    }
}
