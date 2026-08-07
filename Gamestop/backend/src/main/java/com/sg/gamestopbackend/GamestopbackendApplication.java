package com.sg.gamestopbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;

@SpringBootApplication
public class GamestopbackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(GamestopbackendApplication.class, args);
    }

    // Lets Jackson skip Hibernate lazy proxies instead of failing to serialize them.
    @Bean
    public Hibernate6Module hibernate6Module() {
        return new Hibernate6Module();
    }
}