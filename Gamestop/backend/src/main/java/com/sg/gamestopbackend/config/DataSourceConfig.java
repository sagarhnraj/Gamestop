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

        HikariConfig config = new HikariConfig();
        if (hostResolvable) {
            System.out.println("Configuring MySQL DataSource for host: " + host + ":" + dbPort);
            config.setDriverClassName("com.mysql.cj.jdbc.Driver");
            config.setJdbcUrl("jdbc:mysql://" + host + ":" + dbPort + "/" + dbName + "?sslMode=REQUIRED&allowPublicKeyRetrieval=true");
            config.setUsername(dbUsername);
            config.setPassword(dbPassword);
            config.setInitializationFailTimeout(3000);
        } else {
            System.out.println("Configuring H2 Fallback DataSource for unresolvable host: " + host);
            config.setDriverClassName("org.h2.Driver");
            config.setJdbcUrl("jdbc:h2:mem:gamestopdb;DB_CLOSE_DELAY=-1;MODE=MySQL");
            config.setUsername("sa");
            config.setPassword("");
        }

        config.setMaximumPoolSize(5);
        config.setConnectionTimeout(5000);
        return new HikariDataSource(config);
    }
}
