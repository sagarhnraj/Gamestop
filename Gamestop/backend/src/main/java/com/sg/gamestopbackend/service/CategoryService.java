package com.sg.gamestopbackend.service;

import java.util.List;

import com.sg.gamestopbackend.dto.CategoryDto;

public interface CategoryService {

    List<CategoryDto> getAllCategories();

    CategoryDto getCategoryById(Integer categoryId);

    CategoryDto createCategory(CategoryDto categoryDto);

    CategoryDto updateCategory(Integer categoryId, CategoryDto categoryDto);

    void deleteCategory(Integer categoryId);
}