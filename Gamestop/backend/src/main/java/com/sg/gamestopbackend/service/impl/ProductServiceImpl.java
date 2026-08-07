package com.sg.gamestopbackend.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.sg.gamestopbackend.dto.CategoryDto;
import com.sg.gamestopbackend.dto.ProductDto;
import com.sg.gamestopbackend.entity.Category;
import com.sg.gamestopbackend.entity.Product;
import com.sg.gamestopbackend.entity.ProductImage;
import com.sg.gamestopbackend.exception.ResourceNotFoundException;
import com.sg.gamestopbackend.repository.CategoryRepository;
import com.sg.gamestopbackend.repository.ProductImageRepository;
import com.sg.gamestopbackend.repository.ProductRepository;
import com.sg.gamestopbackend.service.ProductService;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;

    public ProductServiceImpl(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            ProductImageRepository productImageRepository) {

        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productImageRepository = productImageRepository;
    }

    @Override
    public List<ProductDto> getAllProducts() {

        return productRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProductDto getProductById(Integer productId) {

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

        if (productDto.getImage() != null && !productDto.getImage().trim().isEmpty()) {
            ProductImage productImage = new ProductImage();
            productImage.setProduct(savedProduct);
            productImage.setImageUrl(productDto.getImage());
            productImageRepository.save(productImage);
        }

        return mapToDto(savedProduct);
    }

    @Override
    public ProductDto updateProduct(
            Integer productId,
            ProductDto productDto) {

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
        product.setImage(productDto.getImage());

        if (productDto.getCategory() != null && productDto.getCategory().getCategoryId() != null) {

            Category category = categoryRepository
                    .findById(productDto.getCategory().getCategoryId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Category not found"));

            product.setCategory(category);

        } else {

            product.setCategory(null);
        }

        Product updatedProduct = productRepository.save(product);

        if (productDto.getImage() != null && !productDto.getImage().trim().isEmpty()) {
            List<ProductImage> existingImages = productImageRepository.findByProduct_ProductId(productId);
            if (!existingImages.isEmpty()) {
                ProductImage img = existingImages.get(0);
                img.setImageUrl(productDto.getImage());
                productImageRepository.save(img);
            } else {
                ProductImage img = new ProductImage();
                img.setProduct(updatedProduct);
                img.setImageUrl(productDto.getImage());
                productImageRepository.save(img);
            }
        }

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

        ProductDto productDto = new ProductDto();

        productDto.setProductId(product.getProductId());
        productDto.setName(product.getName());
        productDto.setDescription(product.getDescription());
        productDto.setPrice(product.getPrice());
        productDto.setStock(product.getStock());
        productDto.setImage(product.getImage());

        // Get first image from productimages table if product.getImage() is empty
        if (productDto.getImage() == null || productDto.getImage().trim().isEmpty()) {
            List<ProductImage> images =
                    productImageRepository.findByProduct_ProductId(product.getProductId());

            if (!images.isEmpty()) {
                productDto.setImage(images.get(0).getImageUrl());
            }
        }

        productDto.setRating(product.getRating());

        if (product.getCategory() != null) {

            CategoryDto categoryDto = new CategoryDto();

            categoryDto.setCategoryId(product.getCategory().getCategoryId());
            categoryDto.setName(product.getCategory().getName());

            productDto.setCategory(categoryDto);
        }

        productDto.setCreatedAt(product.getCreatedAt());
        productDto.setUpdatedAt(product.getUpdatedAt());

        return productDto;
    }
}