package com.sg.gamestopbackend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

@Configuration
public class RazorpayConfig {

    @Value("${razorpay.key.id:}")
    private String keyId;

    @Value("${razorpay.key.secret:}")
    private String keySecret;

    @Bean
    public RazorpayClient razorpayClient() {
        try {
            if (keyId != null && !keyId.trim().isEmpty() && keySecret != null && !keySecret.trim().isEmpty()) {
                return new RazorpayClient(keyId, keySecret);
            }
        } catch (Exception e) {
            System.err.println("RazorpayClient initialization warning: " + e.getMessage());
        }
        return null;
    }
}
