package com.sg.gamestopbackend.service;

import java.util.List;

import com.sg.gamestopbackend.entity.CartItem;

public interface CartService {

    List<CartItem> getCartItems(Integer userId);

    CartItem addToCart(Integer userId, Integer productId);

    CartItem updateQuantity(
            Integer userId,
            Integer productId,
            Integer quantity);

    void removeFromCart(
            Integer userId,
            Integer productId);

    void clearCart(Integer userId);
}