package com.sg.gamestopbackend.config;

import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;

public class RenderNetworkDiagnostic {

    public static void runDiagnostic() {
        System.out.println("==================================================");
        System.out.println("=== RENDER CONTAINER NETWORK DIAGNOSTIC LOG ===");
        System.out.println("==================================================");
        System.out.println("Container OS: " + System.getProperty("os.name") + " (" + System.getProperty("os.arch") + ")");
        System.out.println("Java Version: " + System.getProperty("java.version"));

        String rawHost = System.getenv("DB_HOST");
        boolean hostPresent = rawHost != null && !rawHost.isEmpty();
        boolean hasWhitespace = false;
        int hostLength = 0;
        String hostToTest = "";

        if (hostPresent) {
            hostLength = rawHost.length();
            String trimmed = rawHost.trim().replaceAll("^\"|\"$", "");
            hasWhitespace = (trimmed.length() != rawHost.length());
            hostToTest = trimmed;
        }

        System.out.println("DB_HOST present: " + hostPresent);
        System.out.println("DB_HOST has surrounding whitespace/quotes: " + hasWhitespace);
        System.out.println("DB_HOST length: " + hostLength);

        int port = 15156;
        String rawPort = System.getenv("DB_PORT");
        if (rawPort != null && !rawPort.trim().isEmpty()) {
            try {
                port = Integer.parseInt(rawPort.trim());
            } catch (Exception ignored) {}
        }
        System.out.println("DB_PORT: " + port);

        // 1. /etc/resolv.conf Contents
        try {
            Path resolvPath = Path.of("/etc/resolv.conf");
            if (Files.exists(resolvPath)) {
                System.out.println("--- /etc/resolv.conf contents ---");
                System.out.println(Files.readString(resolvPath));
                System.out.println("----------------------------------");
            } else {
                System.out.println("/etc/resolv.conf: File does not exist");
            }
        } catch (Exception e) {
            System.out.println("Error reading /etc/resolv.conf: " + e.getMessage());
        }

        // 2. DNS Resolution Test for DB_HOST
        if (hostPresent && !hostToTest.isEmpty()) {
            try {
                InetAddress[] addresses = InetAddress.getAllByName(hostToTest);
                List<String> ips = Arrays.stream(addresses).map(InetAddress::getHostAddress).toList();
                System.out.println("DNS resolution result: SUCCESS");
                System.out.println("Resolved IP address(es): " + ips);
            } catch (Exception e) {
                System.out.println("DNS resolution result: FAILED");
                System.out.println("DNS error: " + e.getClass().getName() + ": " + e.getMessage());
            }

            // 3. TCP Connectivity Test to DB_HOST:DB_PORT
            try (Socket socket = new Socket()) {
                socket.connect(new InetSocketAddress(hostToTest, port), 5000);
                System.out.println("TCP connectivity result: SUCCESS (Connected to port " + port + ")");
            } catch (Exception e) {
                System.out.println("TCP connectivity result: FAILED");
                System.out.println("TCP error: " + e.getClass().getName() + ": " + e.getMessage());
            }
        } else {
            System.out.println("Skipping DNS and TCP tests: DB_HOST environment variable is missing or empty.");
        }

        System.out.println("==================================================");
        System.out.println("=== END RENDER NETWORK DIAGNOSTIC ===");
        System.out.println("==================================================");
    }
}
