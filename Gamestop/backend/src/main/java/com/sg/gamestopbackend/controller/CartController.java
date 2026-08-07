package com.sg.gamestopbackend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sg.gamestopbackend.entity.CartItem;
import com.sg.gamestopbackend.service.CartService;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:5173")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<CartItem>> getCart(
            @PathVariable Integer userId) {

        return ResponseEntity.ok(
                cartService.getCartItems(userId));
    }
    

    @PostMapping("/{userId}/{productId}")
    public ResponseEntity<CartItem> addToCart(
            @PathVariable Integer userId,
            @PathVariable Integer productId) {

        return ResponseEntity.ok(
                cartService.addToCart(userId, productId));
    }

    @PutMapping("/{userId}/{productId}/{quantity}")
    public ResponseEntity<CartItem> updateQuantity(
            @PathVariable Integer userId,
            @PathVariable Integer productId,
            @PathVariable Integer quantity) {

        return ResponseEntity.ok(
                cartService.updateQuantity(
                        userId,
                        productId,
                        quantity));
    }

    @DeleteMapping("/{userId}/{productId}")
    public ResponseEntity<Void> removeItem(
            @PathVariable Integer userId,
            @PathVariable Integer productId) {

        cartService.removeFromCart(userId, productId);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> clearCart(
            @PathVariable Integer userId) {

        cartService.clearCart(userId);

        return ResponseEntity.noContent().build();
    }
}