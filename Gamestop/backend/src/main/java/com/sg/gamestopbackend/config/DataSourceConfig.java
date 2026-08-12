package com.sg.gamestopbackend.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.InetAddress;

@Configuration
public class DataSourceConfig {

    @Value("${DB_HOST:localhost}")
    private String dbHost;

    @Value("${DB_PORT:15156}")
    private String dbPort;

    @Value("${DB_NAME:defaultdb}")
    private String dbName;

    @Value("${DB_USERNAME:root}")
    private String dbUsername;

    @Value("${DB_PASSWORD:}")
    private String dbPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        String host = dbHost != null ? dbHost.trim() : "localhost";
        if (host.contains(":")) {
            host = host.split(":")[0];
        }

        boolean hostResolvable = false;
        try {
            if (!"localhost".equalsIgnoreCase(host) && !"127.0.0.1".equalsIgnoreCase(host)) {
                InetAddress addr = InetAddress.getByName(host);
                hostResolvable = addr != null;
            } else {
                hostResolvable = true;
            }
        } catch (Exception e) {
            System.err.println("WARN: DB_HOST '" + host + "' cannot be resolved via DNS: " + e.getMessage());
            hostResolvable = false;
        }

        if (hostResolvable) {
            try {
                System.out.println("Configuring MySQL DataSource for host: " + host + ":" + dbPort);
                HikariConfig mysqlConfig = new HikariConfig();
                mysqlConfig.setDriverClassName("com.mysql.cj.jdbc.Driver");
                mysqlConfig.setJdbcUrl("jdbc:mysql://" + host + ":" + dbPort + "/" + dbName + "?useSSL=true&trustServerCertificate=true&allowPublicKeyRetrieval=true&serverTimezone=UTC");
                mysqlConfig.setUsername(dbUsername);
                mysqlConfig.setPassword(dbPassword);
                mysqlConfig.setInitializationFailTimeout(3000);
                mysqlConfig.setMaximumPoolSize(5);
                mysqlConfig.setConnectionTimeout(5000);
                HikariDataSource ds = new HikariDataSource(mysqlConfig);
                // test a connection
                try (java.sql.Connection conn = ds.getConnection()) {
                    System.out.println("Successfully connected to MySQL at " + host);
                }
                return ds;
            } catch (Exception e) {
                System.err.println("WARN: Failed to initialize MySQL DataSource (" + e.getMessage() + "). Falling back to H2 in-memory database.");
            }
        }

        System.out.println("Configuring H2 Fallback DataSource for host: " + host);
        HikariConfig h2Config = new HikariConfig();
        h2Config.setDriverClassName("org.h2.Driver");
        h2Config.setJdbcUrl("jdbc:h2:mem:gamestopdb;DB_CLOSE_DELAY=-1;MODE=MySQL");
        h2Config.setUsername("sa");
        h2Config.setPassword("");
        h2Config.setMaximumPoolSize(5);
        h2Config.setConnectionTimeout(5000);
        return new HikariDataSource(h2Config);
    }
}
