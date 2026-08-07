package com.sg.gamestopbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sg.gamestopbackend.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Integer> {

    long countByCategory_CategoryId(Integer categoryId);
}