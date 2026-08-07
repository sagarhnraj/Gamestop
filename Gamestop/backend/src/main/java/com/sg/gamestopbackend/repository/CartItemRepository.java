package com.sg.gamestopbackend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sg.gamestopbackend.entity.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Integer> {

    List<CartItem> findByUser_UserId(Integer userId);

    Optional<CartItem> findByUser_UserIdAndProduct_ProductId(
            Integer userId,
            Integer productId);

    void deleteByUser_UserId(Integer userId);
}