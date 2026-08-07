package com.sg.gamestopbackend.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.sg.gamestopbackend.dto.CategoryDto;
import com.sg.gamestopbackend.entity.Category;
import com.sg.gamestopbackend.exception.ResourceNotFoundException;
import com.sg.gamestopbackend.repository.CategoryRepository;
import com.sg.gamestopbackend.service.CategoryService;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public CategoryDto createCategory(CategoryDto categoryDto) {

        Category category = new Category();
        category.setName(categoryDto.getName());

        Category savedCategory = categoryRepository.save(category);

        return mapToDto(savedCategory);
    }

    @Override
    public List<CategoryDto> getAllCategories() {

        return categoryRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryDto getCategoryById(Integer categoryId) {

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found with id: " + categoryId));

        return mapToDto(category);
    }

    @Override
    public CategoryDto updateCategory(Integer categoryId, CategoryDto categoryDto) {

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found with id: " + categoryId));

        category.setName(categoryDto.getName());

        Category updatedCategory = categoryRepository.save(category);

        return mapToDto(updatedCategory);
    }

    @Override
    public void deleteCategory(Integer categoryId) {

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found with id: " + categoryId));

        categoryRepository.delete(category);
    }

    private CategoryDto mapToDto(Category category) {

        CategoryDto dto = new CategoryDto();

        dto.setCategoryId(category.getCategoryId());
        dto.setName(category.getName());

        return dto;
    }
}