package com.sg.gamestopbackend.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.sg.gamestopbackend.config.ProductDataSeeder;
import com.sg.gamestopbackend.dto.CategoryDto;
import com.sg.gamestopbackend.dto.ProductDto;
import com.sg.gamestopbackend.entity.Category;
import com.sg.gamestopbackend.entity.Product;
import com.sg.gamestopbackend.exception.ResourceNotFoundException;
import com.sg.gamestopbackend.repository.CategoryRepository;
import com.sg.gamestopbackend.repository.ProductRepository;
import com.sg.gamestopbackend.service.ProductService;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductDataSeeder productDataSeeder;

    public ProductServiceImpl(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            ProductDataSeeder productDataSeeder) {

        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productDataSeeder = productDataSeeder;
    }

    @Override
    public List<ProductDto> getAllProducts() {
        if (productRepository.count() == 0) {
            System.out.println("No products found in DB. Triggering synchronous ProductDataSeeder...");
            productDataSeeder.seedAll();
        }

        return productRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProductDto getProductById(Integer productId) {
        if (productRepository.count() == 0) {
            productDataSeeder.seedAll();
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with id: " + productId));

        return mapToDto(product);
    }

    @Override
    public ProductDto createProduct(ProductDto productDto) {

        Product product = new Product();

        product.setName(productDto.getName());
        product.setDescription(productDto.getDescription());
        product.setPrice(productDto.getPrice());
        product.setStock(productDto.getStock());
        product.setRating(productDto.getRating() != null ? productDto.getRating() : 4.8);
        product.setImage(productDto.getImage());

        if (productDto.getCategory() != null && productDto.getCategory().getCategoryId() != null) {

            Category category = categoryRepository
                    .findById(productDto.getCategory().getCategoryId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Category not found"));

            product.setCategory(category);
        }

        Product savedProduct = productRepository.save(product);

        return mapToDto(savedProduct);
    }

    @Override
    public ProductDto updateProduct(Integer productId, ProductDto productDto) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with id: " + productId));

        product.setName(productDto.getName());
        product.setDescription(productDto.getDescription());
        product.setPrice(productDto.getPrice());
        product.setStock(productDto.getStock());
        if (productDto.getRating() != null) {
            product.setRating(productDto.getRating());
        }
        if (productDto.getImage() != null) {
            product.setImage(productDto.getImage());
        }

        if (productDto.getCategory() != null && productDto.getCategory().getCategoryId() != null) {

            Category category = categoryRepository
                    .findById(productDto.getCategory().getCategoryId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Category not found"));

            product.setCategory(category);
        }

        Product updatedProduct = productRepository.save(product);

        return mapToDto(updatedProduct);
    }

    @Override
    public void deleteProduct(Integer productId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with id: " + productId));

        productRepository.delete(product);
    }

    private ProductDto mapToDto(Product product) {

        ProductDto dto = new ProductDto();

        dto.setProductId(product.getProductId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStock(product.getStock());
        dto.setRating(product.getRating() != null ? product.getRating() : 4.8);
        dto.setImage(product.getImage());

        if (product.getCategory() != null) {
            CategoryDto categoryDto = new CategoryDto();
            categoryDto.setCategoryId(product.getCategory().getCategoryId());
            categoryDto.setName(product.getCategory().getName() != null ? product.getCategory().getName() : product.getCategory().getCategoryName());
            categoryDto.setCategoryName(product.getCategory().getCategoryName() != null ? product.getCategory().getCategoryName() : product.getCategory().getName());
            dto.setCategory(categoryDto);
        }

        return dto;
    }
}