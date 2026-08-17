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

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sg.gamestopbackend.dto.CategoryDto;
import com.sg.gamestopbackend.dto.ProductDto;
import com.sg.gamestopbackend.dto.VoiceAssistantRequestDto;
import com.sg.gamestopbackend.dto.VoiceAssistantResponseDto;
import com.sg.gamestopbackend.dto.VoiceSuggestionDto;
import com.sg.gamestopbackend.entity.Category;
import com.sg.gamestopbackend.entity.Order;
import com.sg.gamestopbackend.entity.Product;
import com.sg.gamestopbackend.entity.ProductImage;
import com.sg.gamestopbackend.entity.User;
import com.sg.gamestopbackend.repository.CategoryRepository;
import com.sg.gamestopbackend.repository.OrderRepository;
import com.sg.gamestopbackend.repository.ProductImageRepository;
import com.sg.gamestopbackend.repository.ProductRepository;
import com.sg.gamestopbackend.repository.UserRepository;
import com.sg.gamestopbackend.service.VoiceAssistantService;

@Service
public class VoiceAssistantServiceImpl implements VoiceAssistantService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public VoiceAssistantServiceImpl(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            ProductImageRepository productImageRepository,
            OrderRepository orderRepository,
            UserRepository userRepository) {

        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productImageRepository = productImageRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
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

        // 1. Extract Price Constraint
        BigDecimal maxPrice = extractMaxPrice(lowerQuery);

        // 2. Extract Category Match
        String category = extractCategoryName(lowerQuery);

        // 3. Extract Primary Keywords
        List<String> keywords = extractKeywords(lowerQuery);
        String primaryKeyword = keywords.isEmpty() ? null : keywords.get(0);

        // 4. Intent Classification: Fast-path local rule determination (sub-1ms response)
        String intent = determineStrictIntent(lowerQuery, null);

        // Only query Hugging Face if local intent is generic search and query is non-trivial
        if ("PRODUCT_SEARCH".equals(intent) && rawQuery.length() > 20 && System.getenv("HF_TOKEN") != null) {
            String hfIntent = classifyIntentWithHuggingFace(rawQuery, lowerQuery);
            if (hfIntent != null && !"UNKNOWN".equals(hfIntent) && !"PRODUCT_SEARCH".equals(hfIntent)) {
                intent = hfIntent;
            }
        }

        VoiceAssistantResponseDto response = new VoiceAssistantResponseDto(
                intent,
                "",
                category,
                maxPrice,
                keywords,
                Collections.emptyList()
        );

        // Extract Quantity (default 1)
        int quantity = extractQuantity(lowerQuery);

        // 5. Execute Whitelisted Controlled Ecommerce Action
        switch (intent) {
            case "ADD_TOP_PRODUCT":
            case "ADD_CURRENT_PRODUCT":
            case "ADD_TO_CART": {
                boolean isTopProduct = intent.equals("ADD_TOP_PRODUCT") ||
                        lowerQuery.contains("top product") || lowerQuery.contains("first product") ||
                        lowerQuery.contains("first one") || lowerQuery.contains("top result") ||
                        lowerQuery.contains("first result") || lowerQuery.contains("first item");

                boolean isCurrentOrIt = intent.equals("ADD_CURRENT_PRODUCT") ||
                        lowerQuery.contains("this") || lowerQuery.contains("it") ||
                        lowerQuery.contains("these") || lowerQuery.contains("current") || lowerQuery.contains("buy this");

                Product targetProduct = null;

                // 1. If "top product", prioritize lastSearchResultProductId
                if (isTopProduct && requestDto.getLastSearchResultProductId() != null) {
                    targetProduct = productRepository.findById(requestDto.getLastSearchResultProductId()).orElse(null);
                }

                // 2. If currently viewing a product details page, use currentProductId
                if (targetProduct == null && requestDto.getCurrentProductId() != null && !isTopProduct) {
                    targetProduct = productRepository.findById(requestDto.getCurrentProductId()).orElse(null);
                }

                // 3. If user refers to "it" / "this" / "these", use lastSearchResultProductId
                if (targetProduct == null && requestDto.getLastSearchResultProductId() != null && isCurrentOrIt) {
                    targetProduct = productRepository.findById(requestDto.getLastSearchResultProductId()).orElse(null);
                }

                // 4. Otherwise, search by keywords in MySQL database (unless top product requested)
                if (targetProduct == null && primaryKeyword != null && !isTopProduct) {
                    List<Product> matches = productRepository.searchVoiceProducts(primaryKeyword, category, maxPrice);
                    if (matches.isEmpty()) {
                        matches = productRepository.searchVoiceProducts(primaryKeyword, null, null);
                    }
                    if (!matches.isEmpty()) {
                        targetProduct = matches.get(0);
                    }
                }

                // 5. Fallback to lastSearchResultProductId
                if (targetProduct == null && requestDto.getLastSearchResultProductId() != null) {
                    targetProduct = productRepository.findById(requestDto.getLastSearchResultProductId()).orElse(null);
                }

                if (targetProduct != null) {
                    if (targetProduct.getStock() != null && targetProduct.getStock() < quantity) {
                        response.setTextResponse("Sorry, only " + targetProduct.getStock() + " unit(s) of " + targetProduct.getName() + " remain in stock.");
                    } else {
                        response.setAction(isTopProduct ? "ADD_TOP_PRODUCT" : "ADD_TO_CART");
                        response.setResolvedProduct(mapToDto(targetProduct));
                        response.setQuantity(quantity);
                        String qtyStr = quantity > 1 ? (quantity + " × ") : "";
                        response.setTextResponse("Done! " + qtyStr + targetProduct.getName() + " has been added to your cart.");
                    }
                } else if (isTopProduct) {
                    response.setAction("ADD_TOP_PRODUCT");
                    response.setQuantity(quantity);
                    response.setTextResponse("ADD_TOP_PRODUCT");
                } else if (isCurrentOrIt && requestDto.getCurrentProductId() == null && requestDto.getLastSearchResultProductId() == null) {
                    response.setTextResponse("I don't have a product selected right now. Please open a product or tell me which product you'd like.");
                } else {
                    response.setTextResponse("Sorry, I couldn't find that product in the GameStop catalog to add to your cart.");
                }
                break;
            }

            case "REMOVE_FROM_CART": {
                Product targetProduct = null;
                if (primaryKeyword != null) {
                    List<Product> matches = productRepository.searchVoiceProducts(primaryKeyword, null, null);
                    if (!matches.isEmpty()) {
                        targetProduct = matches.get(0);
                    }
                }

                response.setAction("REMOVE_FROM_CART");
                if (targetProduct != null) {
                    response.setResolvedProduct(mapToDto(targetProduct));
                    response.setTextResponse("Removed " + targetProduct.getName() + " from your cart.");
                } else {
                    response.setTextResponse("Removed the requested item from your cart.");
                }
                break;
            }

            case "EMPTY_CART": {
                response.setAction("EMPTY_CART");
                response.setRequiresConfirmation(true);
                response.setTextResponse("Are you sure you want to empty your cart? This will clear all items in your cart.");
                break;
            }

            case "VIEW_CART": {
                response.setAction("VIEW_CART");
                response.setTargetRoute("/cart");
                response.setTextResponse("Showing your shopping cart.");
                break;
            }

            case "GO_TO_CHECKOUT": {
                response.setAction("GO_TO_CHECKOUT");
                response.setTargetRoute("/checkout");
                response.setTextResponse("Taking you to checkout.");
                break;
            }

            case "SHOW_ORDERS": {
                User user = getAuthenticatedUser();
                int orderCount = 0;
                if (user != null) {
                    List<Order> orders = orderRepository.findByUser_UserIdOrderByCreatedAtDesc(user.getUserId());
                    orderCount = orders.size();
                }
                response.setAction("SHOW_ORDERS");
                response.setTargetRoute("/orders");
                response.setTextResponse("You have " + orderCount + " order(s) in your history. Opening your orders page.");
                break;
            }

            case "SHOW_LATEST_ORDER": {
                User user = getAuthenticatedUser();
                Order latestOrder = null;
                if (user != null) {
                    List<Order> orders = orderRepository.findByUser_UserIdOrderByCreatedAtDesc(user.getUserId());
                    if (!orders.isEmpty()) {
                        latestOrder = orders.get(0);
                    }
                }
                response.setAction("SHOW_LATEST_ORDER");
                response.setTargetRoute("/orders");
                if (latestOrder != null) {
                    response.setTextResponse("Your most recent order #" + latestOrder.getOrderId() + " placed on " + latestOrder.getCreatedAt().toLocalDate() + " total ₹" + latestOrder.getTotalAmount() + " is currently " + latestOrder.getStatus() + ".");
                } else {
                    response.setTextResponse("You don't have any past orders yet.");
                }
                break;
            }

            case "CHEAPER_ALTERNATIVE":
            case "SIMILAR_PRODUCTS": {
                List<Product> matches = new ArrayList<>();
                if (requestDto.getCurrentProductId() != null) {
                    Product current = productRepository.findById(requestDto.getCurrentProductId()).orElse(null);
                    if (current != null && current.getCategory() != null) {
                        matches = productRepository.searchVoiceProducts(null, current.getCategory().getName(), current.getPrice());
                    }
                }
                if (matches.isEmpty() && primaryKeyword != null) {
                    matches = productRepository.searchVoiceProducts(primaryKeyword, category, maxPrice);
                }
                if (matches.isEmpty()) {
                    matches = productRepository.searchVoiceProducts(null, null, maxPrice != null ? maxPrice : new BigDecimal("3000"));
                }
                List<ProductDto> dtos = matches.stream().map(this::mapToDto).limit(6).collect(Collectors.toList());
                response.setProducts(dtos);
                response.setTextResponse("Here are " + dtos.size() + " similar/cheaper option(s) from our catalog.");
                break;
            }

            case "PRODUCT_SEARCH":
            case "RECOMMENDATION":
            default: {
                List<Product> matchedEntities = productRepository.searchVoiceProducts(primaryKeyword, category, maxPrice);
                if (matchedEntities.isEmpty() && (category != null || maxPrice != null || primaryKeyword != null)) {
                    matchedEntities = productRepository.searchVoiceProducts(primaryKeyword, null, maxPrice);
                }
                if (matchedEntities.isEmpty() && category != null) {
                    matchedEntities = productRepository.searchVoiceProducts(null, category, null);
                }
                if (matchedEntities.isEmpty() && maxPrice != null) {
                    matchedEntities = productRepository.searchVoiceProducts(null, null, maxPrice);
                }

                List<ProductDto> matchedProducts = matchedEntities.stream()
                        .map(this::mapToDto)
                        .limit(6)
                        .collect(Collectors.toList());

                response.setProducts(matchedProducts);
                response.setTextResponse(generateNaturalLanguageResponse(intent, rawQuery, matchedProducts, category, maxPrice));
                break;
            }
        }

        return response;
    }

    private User getAuthenticatedUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String name = auth.getName();
                return userRepository.findByEmail(name)
                        .orElseGet(() -> userRepository.findByUsername(name).orElse(null));
            }
        } catch (Exception e) {
            // Ignore unauthenticated
        }
        return null;
    }

    private String determineStrictIntent(String lowerQuery, String hfIntent) {
        if (lowerQuery.contains("top product") || lowerQuery.contains("first product") || lowerQuery.contains("first one") || lowerQuery.contains("top result") || lowerQuery.contains("first result") || lowerQuery.contains("first item")) {
            return "ADD_TOP_PRODUCT";
        }
        if (lowerQuery.contains("add this") || lowerQuery.contains("add current") || lowerQuery.contains("buy this") || lowerQuery.contains("add this product")) {
            return "ADD_CURRENT_PRODUCT";
        }
        if (lowerQuery.contains("add") && (lowerQuery.contains("cart") || lowerQuery.contains("buy"))) {
            return "ADD_TO_CART";
        }
        if (lowerQuery.contains("remove") && (lowerQuery.contains("cart") || lowerQuery.contains("item"))) {
            return "REMOVE_FROM_CART";
        }
        if (lowerQuery.contains("empty my cart") || lowerQuery.contains("empty cart") || lowerQuery.contains("clear my cart") || lowerQuery.contains("clear cart") || lowerQuery.contains("remove everything")) {
            return "EMPTY_CART";
        }
        if (lowerQuery.contains("checkout") || lowerQuery.contains("proceed to checkout") || lowerQuery.contains("take me to billing") || lowerQuery.contains("payment page")) {
            return "GO_TO_CHECKOUT";
        }
        if (lowerQuery.contains("show my cart") || lowerQuery.contains("view cart") || lowerQuery.contains("what's in my cart") || lowerQuery.contains("how much is my cart")) {
            return "VIEW_CART";
        }
        if (lowerQuery.contains("latest order") || lowerQuery.contains("last order") || lowerQuery.contains("recent order")) {
            return "SHOW_LATEST_ORDER";
        }
        if (lowerQuery.contains("show my orders") || lowerQuery.contains("my orders") || lowerQuery.contains("what have i ordered")) {
            return "SHOW_ORDERS";
        }
        if (lowerQuery.contains("cheaper") || lowerQuery.contains("less expensive")) {
            return "CHEAPER_ALTERNATIVE";
        }
        if (lowerQuery.contains("similar")) {
            return "SIMILAR_PRODUCTS";
        }
        if (hfIntent != null && !hfIntent.equals("UNKNOWN")) {
            return hfIntent;
        }
        return "PRODUCT_SEARCH";
    }

    private int extractQuantity(String lowerQuery) {
        if (lowerQuery.contains("two") || lowerQuery.contains(" 2 ")) return 2;
        if (lowerQuery.contains("three") || lowerQuery.contains(" 3 ")) return 3;
        if (lowerQuery.contains("four") || lowerQuery.contains(" 4 ")) return 4;
        if (lowerQuery.contains("five") || lowerQuery.contains(" 5 ")) return 5;
        Matcher matcher = Pattern.compile("(\\d+)\\s*(of|items|units|mice|keyboards|controllers)?").matcher(lowerQuery);
        if (matcher.find()) {
            try {
                int val = Integer.parseInt(matcher.group(1));
                if (val > 0 && val < 50) return val;
            } catch (Exception e) {}
        }
        return 1;
    }

    @Override
    public List<VoiceSuggestionDto> getDynamicSuggestions() {
        List<VoiceSuggestionDto> verifiedSuggestions = new ArrayList<>();

        List<Category> categories = categoryRepository.findAll();
        for (Category c : categories) {
            String name = c.getName() != null ? c.getName() : c.getCategoryName();
            if (name == null || name.trim().isEmpty()) continue;

            long count = productRepository.countByCategory_CategoryId(c.getCategoryId());
            if (count > 0) {
                String queryText = "Show me " + name;
                List<Product> matches = productRepository.searchVoiceProducts(null, name, null);
                if (matches.isEmpty()) {
                    matches = productRepository.searchVoiceProducts(name, null, null);
                }

                if (!matches.isEmpty()) {
                    String icon = getCategoryIcon(name);
                    verifiedSuggestions.add(new VoiceSuggestionDto(icon + " " + name, queryText));
                }
            }
        }

        List<BigDecimal> testPrices = Arrays.asList(new BigDecimal("3000"), new BigDecimal("5000"), new BigDecimal("10000"));
        for (BigDecimal price : testPrices) {
            List<Product> priceMatches = productRepository.searchVoiceProducts(null, null, price);
            if (!priceMatches.isEmpty()) {
                verifiedSuggestions.add(new VoiceSuggestionDto("💰 Below ₹" + price.intValue(), "Show items below " + price.intValue()));
                break;
            }
        }

        if (verifiedSuggestions.size() > 4) {
            return verifiedSuggestions.subList(0, 4);
        }

        return verifiedSuggestions;
    }

    private String getCategoryIcon(String catName) {
        String lower = catName.toLowerCase();
        if (lower.contains("game")) return "🎮";
        if (lower.contains("console")) return "🕹️";
        if (lower.contains("accessori") || lower.contains("setup")) return "🔌";
        if (lower.contains("head")) return "🎧";
        if (lower.contains("mouse")) return "🖱️";
        if (lower.contains("keyb")) return "⌨️";
        return "📦";
    }

    private String classifyIntentWithHuggingFace(String rawQuery, String lowerQuery) {
        String fallbackIntent = "PRODUCT_SEARCH";

        String hfToken = System.getenv("HF_TOKEN");
        if (hfToken == null || hfToken.trim().isEmpty()) {
            return fallbackIntent;
        }

        try {
            String endpointUrl = System.getenv("HF_SPACE_URL");
            if (endpointUrl == null || endpointUrl.trim().isEmpty()) {
                endpointUrl = "https://router.huggingface.co/hf-inference/models/facebook/bart-large-mnli";
            }

            String payload = String.format(
                    "{\"inputs\": \"%s\", \"parameters\": {\"candidate_labels\": [\"PRODUCT_SEARCH\", \"ADD_TO_CART\", \"REMOVE_FROM_CART\", \"EMPTY_CART\", \"VIEW_CART\", \"GO_TO_CHECKOUT\", \"SHOW_ORDERS\", \"SHOW_LATEST_ORDER\", \"RECOMMENDATION\"]}}",
                    rawQuery.replace("\"", "\\\"")
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpointUrl))
                    .header("Authorization", "Bearer " + hfToken)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .timeout(Duration.ofMillis(1500))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                if (root.has("labels") && root.get("labels").isArray() && root.get("labels").size() > 0) {
                    return root.get("labels").get(0).asText();
                }
            }
        } catch (Exception e) {
            // Silently fallback to pattern matching
        }

        return fallbackIntent;
    }

    private BigDecimal extractMaxPrice(String lowerQuery) {
        Pattern pattern = Pattern.compile("(under|below|less than|within|around)\\s*₹?\\s*(\\d+)");
        Matcher matcher = pattern.matcher(lowerQuery);
        if (matcher.find()) {
            try {
                return new BigDecimal(matcher.group(2));
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

    private String extractCategoryName(String lowerQuery) {
        List<Category> categories = categoryRepository.findAll();
        for (Category cat : categories) {
            String catName = cat.getName() != null ? cat.getName() : cat.getCategoryName();
            if (catName != null && !catName.trim().isEmpty()) {
                if (lowerQuery.contains(catName.toLowerCase())) {
                    return catName;
                }
            }
        }

        if (lowerQuery.contains("mouse") || lowerQuery.contains("mice")) return "Mouse";
        if (lowerQuery.contains("headset") || lowerQuery.contains("headphone")) return "Headsets";
        if (lowerQuery.contains("keyboard")) return "Keyboard";
        if (lowerQuery.contains("console") || lowerQuery.contains("ps5") || lowerQuery.contains("xbox")) return "Consoles";
        if (lowerQuery.contains("game")) return "Games";

        return null;
    }

    private List<String> extractKeywords(String lowerQuery) {
        List<String> stopWords = Arrays.asList(
                "find", "me", "a", "an", "the", "under", "below", "less", "than", "show",
                "for", "rupees", "rs", "in", "with", "gaming", "best", "add", "to", "my",
                "cart", "remove", "from", "empty", "clear", "checkout", "orders", "latest",
                "this", "one", "buy", "please", "can", "you", "i", "want"
        );

        String cleaned = lowerQuery.replaceAll("[^a-zA-Z0-9\\s]", "");
        String[] words = cleaned.split("\\s+");

        List<String> keywords = new ArrayList<>();
        for (String w : words) {
            if (!w.trim().isEmpty() && !stopWords.contains(w) && w.length() > 2 && !w.matches("\\d+")) {
                keywords.add(w);
            }
        }

        return keywords;
    }

    private String generateNaturalLanguageResponse(String intent, String rawQuery, List<ProductDto> products, String category, BigDecimal maxPrice) {
        int count = products.size();

        if (count == 0) {
            StringBuilder sb = new StringBuilder("I couldn't find any products in our GameStop catalog");
            if (category != null) {
                sb.append(" matching category '").append(category).append("'");
            }
            if (maxPrice != null) {
                sb.append(" under ₹").append(maxPrice);
            }
            sb.append(". Try searching for another item like gaming mice, keyboards, or headsets!");
            return sb.toString();
        }

        ProductDto top = products.get(0);
        return String.format(
                "I found %d matching product(s). Top result: %s for ₹%.2f.",
                count, top.getName(), top.getPrice()
        );
    }

    private ProductDto mapToDto(Product p) {
        ProductDto dto = new ProductDto();
        dto.setProductId(p.getProductId());
        dto.setName(p.getName());
        dto.setDescription(p.getDescription());
        dto.setPrice(p.getPrice());
        dto.setStock(p.getStock());

        if (p.getCategory() != null) {
            CategoryDto cDto = new CategoryDto();
            cDto.setCategoryId(p.getCategory().getCategoryId());
            cDto.setName(p.getCategory().getName() != null ? p.getCategory().getName() : p.getCategory().getCategoryName());
            dto.setCategory(cDto);
        }

        List<ProductImage> images = productImageRepository.findByProduct_ProductId(p.getProductId());
        if (!images.isEmpty()) {
            dto.setImage(images.get(0).getImageUrl());
        }

        return dto;
    }
}
