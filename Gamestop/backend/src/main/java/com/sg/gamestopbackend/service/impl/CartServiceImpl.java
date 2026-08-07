package com.sg.gamestopbackend.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sg.gamestopbackend.entity.CartItem;
import com.sg.gamestopbackend.entity.Product;
import com.sg.gamestopbackend.entity.ProductImage;
import com.sg.gamestopbackend.entity.User;
import com.sg.gamestopbackend.exception.ResourceNotFoundException;
import com.sg.gamestopbackend.repository.CartItemRepository;
import com.sg.gamestopbackend.repository.ProductImageRepository;
import com.sg.gamestopbackend.repository.ProductRepository;
import com.sg.gamestopbackend.repository.UserRepository;
import com.sg.gamestopbackend.service.CartService;

@Service
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;

    public CartServiceImpl(
            CartItemRepository cartItemRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            ProductImageRepository productImageRepository) {

        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
    }

    @Override
    public List<CartItem> getCartItems(Integer userId) {
        List<CartItem> items = cartItemRepository.findByUser_UserId(userId);
        for (CartItem item : items) {
            ensureProductImage(item.getProduct());
        }
        return items;
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

            CartItem saved = cartItemRepository.save(existing);
            ensureProductImage(saved.getProduct());
            return saved;
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

        CartItem saved = cartItemRepository.save(cartItem);
        ensureProductImage(saved.getProduct());
        return saved;
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

        CartItem saved = cartItemRepository.save(cartItem);
        ensureProductImage(saved.getProduct());
        return saved;
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

    private void ensureProductImage(Product product) {
        if (product == null) return;
        if (product.getImage() == null || product.getImage().trim().isEmpty()) {
            List<ProductImage> images = productImageRepository.findByProduct_ProductId(product.getProductId());
            if (images != null && !images.isEmpty()) {
                product.setImage(images.get(0).getImageUrl());
            }
        }
    }
}