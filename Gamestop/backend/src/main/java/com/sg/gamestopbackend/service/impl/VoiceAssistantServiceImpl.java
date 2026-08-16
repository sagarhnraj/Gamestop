package com.sg.gamestopbackend.service.impl;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sg.gamestopbackend.dto.CategoryDto;
import com.sg.gamestopbackend.dto.ProductDto;
import com.sg.gamestopbackend.dto.VoiceAssistantRequestDto;
import com.sg.gamestopbackend.dto.VoiceAssistantResponseDto;
import com.sg.gamestopbackend.entity.Category;
import com.sg.gamestopbackend.entity.Product;
import com.sg.gamestopbackend.entity.ProductImage;
import com.sg.gamestopbackend.repository.CategoryRepository;
import com.sg.gamestopbackend.repository.ProductImageRepository;
import com.sg.gamestopbackend.repository.ProductRepository;
import com.sg.gamestopbackend.service.VoiceAssistantService;

@Service
public class VoiceAssistantServiceImpl implements VoiceAssistantService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public VoiceAssistantServiceImpl(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            ProductImageRepository productImageRepository) {

        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productImageRepository = productImageRepository;
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    @Override
    public VoiceAssistantResponseDto processVoiceQuery(VoiceAssistantRequestDto requestDto) {
        if (requestDto == null || requestDto.getQuery() == null || requestDto.getQuery().trim().isEmpty()) {
            return new VoiceAssistantResponseDto(
                    "UNKNOWN",
                    "I didn't catch that. Please speak or type your request.",
                    null,
                    null,
                    Collections.emptyList(),
                    Collections.emptyList()
            );
        }

        String rawQuery = requestDto.getQuery().trim();
        String lowerQuery = rawQuery.toLowerCase();

        // 1. Extract Price Constraint (e.g. "under 2000", "below 3000", "less than 1500")
        BigDecimal maxPrice = extractMaxPrice(lowerQuery);

        // 2. Extract Category Match from existing categories
        String category = extractCategoryName(lowerQuery);

        // 3. Extract Primary Keywords
        List<String> keywords = extractKeywords(lowerQuery);
        String primaryKeyword = keywords.isEmpty() ? null : keywords.get(0);

        // 4. Intent Classification via Hugging Face API / Server-Side HF_TOKEN if available
        String intent = classifyIntentWithHuggingFace(rawQuery, lowerQuery);

        // 5. Query REAL Database (ProductRepository) - MySQL is 100% source of truth
        List<Product> matchedEntities = productRepository.searchVoiceProducts(primaryKeyword, category, maxPrice);

        // Fallback: If strict search returns empty, try broader matching by keyword or category
        if (matchedEntities.isEmpty() && (category != null || maxPrice != null || primaryKeyword != null)) {
            matchedEntities = productRepository.searchVoiceProducts(primaryKeyword, null, maxPrice);
        }
        if (matchedEntities.isEmpty() && category != null) {
            matchedEntities = productRepository.searchVoiceProducts(null, category, null);
        }

        // Convert matched entities to ProductDto list
        List<ProductDto> matchedProducts = matchedEntities.stream()
                .map(this::mapToDto)
                .limit(6)
                .collect(Collectors.toList());

        // 6. Generate Natural Language Response based ONLY on real database results
        String textResponse = generateNaturalLanguageResponse(intent, rawQuery, matchedProducts, category, maxPrice);

        return new VoiceAssistantResponseDto(
                intent,
                textResponse,
                category,
                maxPrice,
                keywords,
                matchedProducts
        );
    }

    private String classifyIntentWithHuggingFace(String rawQuery, String lowerQuery) {
        // Default rule-based intent fallback
        String fallbackIntent = "PRODUCT_SEARCH";
        if (lowerQuery.contains("keyboard") || lowerQuery.contains("mouse") || lowerQuery.contains("headset") || lowerQuery.contains("category")) {
            fallbackIntent = "CATEGORY_SEARCH";
        }
        if (lowerQuery.contains("under") || lowerQuery.contains("below") || lowerQuery.contains("cheap") || lowerQuery.contains("less than")) {
            fallbackIntent = "PRICE_FILTER";
        }
        if (lowerQuery.contains("best") || lowerQuery.contains("recommend") || lowerQuery.contains("good")) {
            fallbackIntent = "RECOMMENDATION";
        }
        if (lowerQuery.contains("which is better") || lowerQuery.contains("compare") || lowerQuery.contains("difference")) {
            fallbackIntent = "PRODUCT_COMPARISON";
        }
        if (lowerQuery.contains("does this") || lowerQuery.contains("has rgb") || lowerQuery.contains("wireless") || lowerQuery.contains("feature")) {
            fallbackIntent = "PRODUCT_QUESTION";
        }

        // Read HF_TOKEN strictly from server-side environment variable System.getenv("HF_TOKEN")
        String hfToken = System.getenv("HF_TOKEN");

        if (hfToken == null || hfToken.trim().isEmpty()) {
            return fallbackIntent;
        }

        try {
            String spaceUrl = System.getenv("HF_SPACE_URL");
            String targetEndpoint = (spaceUrl != null && !spaceUrl.trim().isEmpty())
                    ? spaceUrl
                    : "https://router.huggingface.co/hf-inference/models/facebook/bart-large-mnli";

            String payloadJson = objectMapper.writeValueAsString(new ZeroShotPayload(
                    rawQuery,
                    Arrays.asList("PRODUCT_SEARCH", "CATEGORY_SEARCH", "PRICE_FILTER", "RECOMMENDATION", "PRODUCT_QUESTION", "PRODUCT_COMPARISON")
            ));

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(targetEndpoint))
                    .header("Authorization", "Bearer " + hfToken.trim())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payloadJson))
                    .timeout(Duration.ofSeconds(4))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                if (root.isArray() && root.size() > 0) {
                    JsonNode topResult = root.get(0);
                    if (topResult.has("label")) {
                        return topResult.get("label").asText();
                    }
                } else if (root.has("labels") && root.get("labels").isArray() && root.get("labels").size() > 0) {
                    return root.get("labels").get(0).asText();
                }
            }
        } catch (Exception e) {
            // Silence HF network exceptions gracefully, falling back to rule-based classification
        }

        return fallbackIntent;
    }

    private BigDecimal extractMaxPrice(String lowerQuery) {
        Pattern pattern = Pattern.compile("(under|below|less than|within|around|under rupees|below rupees|rs|₹)\\s*(\\d+)");
        Matcher matcher = pattern.matcher(lowerQuery);
        if (matcher.find()) {
            try {
                return new BigDecimal(matcher.group(2));
            } catch (Exception e) {
                // ignore
            }
        }

        // Standalone number matching (e.g. "2000 mouse")
        Pattern standaloneNum = Pattern.compile("\\b(\\d{3,6})\\b");
        Matcher matcherNum = standaloneNum.matcher(lowerQuery);
        if (matcherNum.find()) {
            try {
                return new BigDecimal(matcherNum.group(1));
            } catch (Exception e) {
                // ignore
            }
        }

        return null;
    }

    private String extractCategoryName(String lowerQuery) {
        List<Category> categories = categoryRepository.findAll();
        for (Category c : categories) {
            if (c.getName() != null && lowerQuery.contains(c.getName().toLowerCase())) {
                return c.getName();
            }
        }

        if (lowerQuery.contains("mouse") || lowerQuery.contains("mice")) return "Mouse";
        if (lowerQuery.contains("keyboard")) return "Keyboard";
        if (lowerQuery.contains("headset") || lowerQuery.contains("headphone")) return "Headset";
        if (lowerQuery.contains("console") || lowerQuery.contains("ps5") || lowerQuery.contains("xbox")) return "Console";
        if (lowerQuery.contains("controller") || lowerQuery.contains("gamepad")) return "Controller";

        return null;
    }

    private List<String> extractKeywords(String lowerQuery) {
        List<String> keywords = new ArrayList<>();
        String[] stopWords = {"find", "me", "a", "an", "the", "show", "under", "below", "rupees", "rs", "less", "than", "for", "good", "best", "gaming", "please", "i", "need", "want"};

        String[] tokens = lowerQuery.split("\\s+");
        for (String t : tokens) {
            t = t.replaceAll("[^a-zA-Z0-9]", "");
            if (t.length() > 2 && !Arrays.asList(stopWords).contains(t)) {
                keywords.add(t);
            }
        }

        if (keywords.isEmpty() && lowerQuery.contains("gaming")) {
            keywords.add("gaming");
        }

        return keywords;
    }

    private String generateNaturalLanguageResponse(
            String intent,
            String rawQuery,
            List<ProductDto> products,
            String category,
            BigDecimal maxPrice) {

        if (products.isEmpty()) {
            StringBuilder sb = new StringBuilder("I couldn't find any products in our GameStop catalog");
            if (category != null) sb.append(" matching category '").append(category).append("'");
            if (maxPrice != null) sb.append(" under ₹").append(maxPrice);
            sb.append(". Try searching for another item like gaming mice, keyboards, or headsets!");
            return sb.toString();
        }

        ProductDto top = products.get(0);
        int count = products.size();

        if ("RECOMMENDATION".equalsIgnoreCase(intent)) {
            return String.format("Based on your search, I highly recommend the %s. It is available for ₹%s with a rating of %.1f/5 stars.",
                    top.getName(), top.getPrice(), top.getRating() != null ? top.getRating() : 4.5);
        }

        if ("PRODUCT_QUESTION".equalsIgnoreCase(intent)) {
            return String.format("Here is details for %s: %s. Priced at ₹%s.",
                    top.getName(), top.getDescription() != null ? top.getDescription() : "High performance gaming gear", top.getPrice());
        }

        StringBuilder sb = new StringBuilder();
        sb.append("I found ").append(count).append(count == 1 ? " matching product" : " matching products");
        if (category != null) sb.append(" in ").append(category);
        if (maxPrice != null) sb.append(" under ₹").append(maxPrice);
        sb.append(". Top result: ").append(top.getName()).append(" for ₹").append(top.getPrice()).append(".");

        return sb.toString();
    }

    private ProductDto mapToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setProductId(product.getProductId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStock(product.getStock());
        dto.setImage(product.getImage());

        if (dto.getImage() == null || dto.getImage().trim().isEmpty()) {
            List<ProductImage> images = productImageRepository.findByProduct_ProductId(product.getProductId());
            if (!images.isEmpty()) {
                dto.setImage(images.get(0).getImageUrl());
            }
        }

        dto.setRating(product.getRating());

        if (product.getCategory() != null) {
            CategoryDto cDto = new CategoryDto();
            cDto.setCategoryId(product.getCategory().getCategoryId());
            cDto.setName(product.getCategory().getName());
            dto.setCategory(cDto);
        }

        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());

        return dto;
    }

    private static class ZeroShotPayload {
        public String inputs;
        public Parameters parameters;

        public ZeroShotPayload(String inputs, List<String> labels) {
            this.inputs = inputs;
            this.parameters = new Parameters(labels);
        }
    }

    private static class Parameters {
        public List<String> candidate_labels;

        public Parameters(List<String> candidate_labels) {
            this.candidate_labels = candidate_labels;
        }
    }
}
