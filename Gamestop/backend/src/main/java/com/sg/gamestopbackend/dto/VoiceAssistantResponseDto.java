package com.sg.gamestopbackend.dto;

import java.math.BigDecimal;
import java.util.List;

public class VoiceAssistantResponseDto {

    private String intent;
    private String textResponse;
    private String extractedCategory;
    private BigDecimal extractedMaxPrice;
    private List<String> extractedKeywords;
    private List<ProductDto> products;

    public VoiceAssistantResponseDto() {
    }

    public VoiceAssistantResponseDto(
            String intent,
            String textResponse,
            String extractedCategory,
            BigDecimal extractedMaxPrice,
            List<String> extractedKeywords,
            List<ProductDto> products) {

        this.intent = intent;
        this.textResponse = textResponse;
        this.extractedCategory = extractedCategory;
        this.extractedMaxPrice = extractedMaxPrice;
        this.extractedKeywords = extractedKeywords;
        this.products = products;
    }

    public String getIntent() {
        return intent;
    }

    public void setIntent(String intent) {
        this.intent = intent;
    }

    public String getTextResponse() {
        return textResponse;
    }

    public void setTextResponse(String textResponse) {
        this.textResponse = textResponse;
    }

    public String getExtractedCategory() {
        return extractedCategory;
    }

    public void setExtractedCategory(String extractedCategory) {
        this.extractedCategory = extractedCategory;
    }

    public BigDecimal getExtractedMaxPrice() {
        return extractedMaxPrice;
    }

    public void setExtractedMaxPrice(BigDecimal extractedMaxPrice) {
        this.extractedMaxPrice = extractedMaxPrice;
    }

    public List<String> getExtractedKeywords() {
        return extractedKeywords;
    }

    public void setExtractedKeywords(List<String> extractedKeywords) {
        this.extractedKeywords = extractedKeywords;
    }

    public List<ProductDto> getProducts() {
        return products;
    }

    public void setProducts(List<ProductDto> products) {
        this.products = products;
    }
}
