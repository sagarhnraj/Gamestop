package com.sg.gamestopbackend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sg.gamestopbackend.entity.Order;

public interface OrderRepository extends JpaRepository<Order, String> {

    List<Order> findByUser_UserIdOrderByCreatedAtDesc(Integer userId);
}
