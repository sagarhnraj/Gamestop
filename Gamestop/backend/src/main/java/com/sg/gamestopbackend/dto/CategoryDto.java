package com.sg.gamestopbackend.dto;

public class CategoryDto {

    private Integer categoryId;
    private String name;
    private String categoryName;
    private Long productCount;

    public CategoryDto() {
    }

    public CategoryDto(Integer categoryId, String name) {
        this.categoryId = categoryId;
        this.name = name;
        this.categoryName = name;
    }

    public CategoryDto(Integer categoryId, String name, Long productCount) {
        this.categoryId = categoryId;
        this.name = name;
        this.categoryName = name;
        this.productCount = productCount;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        this.categoryName = name;
    }

    public String getCategoryName() {
        return categoryName != null ? categoryName : name;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
        if (this.name == null) {
            this.name = categoryName;
        }
    }

    public Long getProductCount() {
        return productCount;
    }

    public void setProductCount(Long productCount) {
        this.productCount = productCount;
    }
}