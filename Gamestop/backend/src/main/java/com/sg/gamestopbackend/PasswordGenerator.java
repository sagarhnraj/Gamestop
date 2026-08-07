package com.sg.gamestopbackend;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {

    public static void main(String[] args) {

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        System.out.println("Admin Password Hash:");
        System.out.println(encoder.encode("Hnsagar@2004"));

        System.out.println();

        System.out.println("Customer Password Hash:");
        System.out.println(encoder.encode("deep@2004"));
    }
}