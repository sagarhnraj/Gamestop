package com.sg.gamestopbackend.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.sg.gamestopbackend.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Integer> {

    long countByCategory_CategoryId(Integer categoryId);

    @Query("SELECT p FROM Product p WHERE " +
           "(:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:category IS NULL OR LOWER(p.category.name) LIKE LOWER(CONCAT('%', :category, '%'))) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice)")
    List<Product> searchVoiceProducts(
            @Param("keyword") String keyword,
            @Param("category") String category,
            @Param("maxPrice") BigDecimal maxPrice
    );
}