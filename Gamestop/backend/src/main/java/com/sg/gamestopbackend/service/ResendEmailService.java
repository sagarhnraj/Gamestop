package com.sg.gamestopbackend.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ResendEmailService {

    @Value("${resend.api.key:${RESEND_API_KEY:}}")
    private String resendApiKey;

    @Value("${resend.from.email:${MAIL_FROM_EMAIL:onboarding@resend.dev}}")
    private String fromEmail;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public boolean sendOtpEmail(String toEmail, String otp) {
        String apiKey = (resendApiKey != null && !resendApiKey.isBlank()) ? resendApiKey.trim() : System.getenv("RESEND_API_KEY");
        if (apiKey == null || apiKey.isBlank()) {
            System.err.println("[ResendEmailService] RESEND_API_KEY environment variable is NOT configured on Render. Cannot send OTP email.");
            return false;
        }
        apiKey = apiKey.trim();

        String envSender = System.getenv("MAIL_FROM_EMAIL");
        String sender = (envSender != null && !envSender.isBlank()) ? envSender.trim() : ((fromEmail != null && !fromEmail.isBlank()) ? fromEmail.trim() : "onboarding@resend.dev");
        String subject = "Your GameStop Registration OTP";
        String content = "Hello,\n\nYour OTP for GameStop account registration is: " + otp + "\n\nThis OTP will expire in 5 minutes.\nIf you did not request this, please ignore this email.";

        // Escape JSON characters
        String escapedSubject = subject.replace("\"", "\\\"");
        String escapedContent = content.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");

        String jsonBody = String.format(
                "{\"from\":\"GameStop <%s>\",\"to\":[\"%s\"],\"subject\":\"%s\",\"text\":\"%s\"}",
                sender, toEmail, escapedSubject, escapedContent
        );

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .timeout(Duration.ofSeconds(10))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                System.out.println("Email successfully dispatched via Resend HTTPS API to: " + toEmail + " (HTTP " + response.statusCode() + ")");
                return true;
            } else {
                System.err.println("Resend HTTPS API returned error code " + response.statusCode() + ": " + response.body());
                return false;
            }
        } catch (Exception e) {
            System.err.println("Resend HTTPS API request failed: " + e.getMessage());
            return false;
        }
    }
}
