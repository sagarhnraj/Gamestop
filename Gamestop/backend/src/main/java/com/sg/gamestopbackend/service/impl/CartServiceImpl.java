package com.sg.gamestopbackend.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sg.gamestopbackend.entity.CartItem;
import com.sg.gamestopbackend.entity.Product;
import com.sg.gamestopbackend.entity.User;
import com.sg.gamestopbackend.exception.ResourceNotFoundException;
import com.sg.gamestopbackend.repository.CartItemRepository;
import com.sg.gamestopbackend.repository.ProductRepository;
import com.sg.gamestopbackend.repository.UserRepository;
import com.sg.gamestopbackend.service.CartService;

@Service
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public CartServiceImpl(
            CartItemRepository cartItemRepository,
            UserRepository userRepository,
            ProductRepository productRepository) {

        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Override
    public List<CartItem> getCartItems(Integer userId) {
        return cartItemRepository.findByUser_UserId(userId);
    }

    @Override
    public CartItem addToCart(Integer userId, Integer productId) {

        CartItem existing = cartItemRepository
                .findByUser_UserIdAndProduct_ProductId(
                        userId,
                        productId)
                .orElse(null);

        if (existing != null) {

            existing.setQuantity(existing.getQuantity() + 1);

            return cartItemRepository.save(existing);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found"));

        CartItem cartItem = new CartItem();

        cartItem.setUser(user);
        cartItem.setProduct(product);
        cartItem.setQuantity(1);

        return cartItemRepository.save(cartItem);
    }

    @Override
    public CartItem updateQuantity(
            Integer userId,
            Integer productId,
            Integer quantity) {

        CartItem cartItem = cartItemRepository
                .findByUser_UserIdAndProduct_ProductId(
                        userId,
                        productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cart item not found"));

        cartItem.setQuantity(quantity);

        return cartItemRepository.save(cartItem);
    }

    @Override
    public void removeFromCart(
            Integer userId,
            Integer productId) {

        CartItem cartItem = cartItemRepository
                .findByUser_UserIdAndProduct_ProductId(
                        userId,
                        productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cart item not found"));

        cartItemRepository.delete(cartItem);
    }

    @Override
    public void clearCart(Integer userId) {
        cartItemRepository.deleteByUser_UserId(userId);
    }
}