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
    private final com.sg.gamestopbackend.repository.ProductRepository productRepository;

    public CategoryServiceImpl(
            CategoryRepository categoryRepository,
            com.sg.gamestopbackend.repository.ProductRepository productRepository) {

        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Override
    public CategoryDto createCategory(CategoryDto categoryDto) {

        String trimmedName = categoryDto.getName() != null ? categoryDto.getName().trim() : "";
        if (trimmedName.isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be empty.");
        }

        if (categoryRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new IllegalArgumentException("Category name '" + trimmedName + "' already exists.");
        }

        Category category = new Category();
        category.setName(trimmedName);

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

        String trimmedName = categoryDto.getName() != null ? categoryDto.getName().trim() : "";
        if (trimmedName.isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be empty.");
        }

        if (categoryRepository.existsByNameIgnoreCaseAndCategoryIdNot(trimmedName, categoryId)) {
            throw new IllegalArgumentException("Category name '" + trimmedName + "' already exists.");
        }

        category.setName(trimmedName);

        Category updatedCategory = categoryRepository.save(category);

        return mapToDto(updatedCategory);
    }

    @Override
    public void deleteCategory(Integer categoryId) {

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found with id: " + categoryId));

        long count = productRepository.countByCategory_CategoryId(categoryId);
        if (count > 0) {
            throw new IllegalArgumentException(
                    "Cannot delete category '" + category.getName() + "' because it contains "
                            + count + " product(s). Please reassign or delete the products in this category first.");
        }

        categoryRepository.delete(category);
    }

    private CategoryDto mapToDto(Category category) {

        CategoryDto dto = new CategoryDto();

        dto.setCategoryId(category.getCategoryId());
        String resolvedName = category.getName();
        dto.setName(resolvedName);
        dto.setCategoryName(resolvedName);

        long count = productRepository.countByCategory_CategoryId(category.getCategoryId());
        dto.setProductCount(count);

        return dto;
    }
}