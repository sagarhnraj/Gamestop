package com.sg.gamestopbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import com.sg.gamestopbackend.config.RenderNetworkDiagnostic;

@SpringBootApplication
public class GamestopbackendApplication {

    static {
        try {
            String dbHost = System.getenv("DB_HOST");
            String dbPort = System.getenv("DB_PORT");
            if (dbHost != null && !dbHost.trim().isEmpty()) {
                String cleanHost = dbHost.trim().replaceAll("^\"|\"$", "");
                if (cleanHost.contains(":")) {
                    String[] parts = cleanHost.split(":");
                    cleanHost = parts[0];
                    if (parts.length > 1 && (dbPort == null || dbPort.trim().isEmpty())) {
                        System.setProperty("DB_PORT", parts[1]);
                    }
                }
                System.setProperty("DB_HOST", cleanHost);
            }
        } catch (Exception e) {
            System.err.println("Static env sanitizer warning: " + e.getMessage());
        }
    }

    public static void main(String[] args) {
        try {
            RenderNetworkDiagnostic.runDiagnostic();
            SpringApplication.run(GamestopbackendApplication.class, args);
        } catch (Throwable t) {
            System.err.println("=== FATAL STARTUP EXCEPTION ===");
            t.printStackTrace(System.err);
            System.err.println("===============================");
            throw t;
        }
    }

    // Lets Jackson skip Hibernate lazy proxies instead of failing to serialize them.
    @Bean
    public Hibernate6Module hibernate6Module() {
        return new Hibernate6Module();
    }
}