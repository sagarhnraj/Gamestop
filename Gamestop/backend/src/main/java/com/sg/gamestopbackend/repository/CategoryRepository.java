package com.sg.gamestopbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sg.gamestopbackend.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Integer> {

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndCategoryIdNot(String name, Integer categoryId);
}