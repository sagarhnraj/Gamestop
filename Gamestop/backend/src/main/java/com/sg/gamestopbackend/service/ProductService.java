package com.sg.gamestopbackend.service;

import java.util.List;

import com.sg.gamestopbackend.dto.ProductDto;

public interface ProductService {

    List<ProductDto> getAllProducts();

    ProductDto getProductById(Integer productId);

    ProductDto createProduct(ProductDto productDto);

    ProductDto updateProduct(Integer productId, ProductDto productDto);

    void deleteProduct(Integer productId);
}