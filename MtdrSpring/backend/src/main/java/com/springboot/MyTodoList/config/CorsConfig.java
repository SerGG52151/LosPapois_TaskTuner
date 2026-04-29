package com.springboot.MyTodoList.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;
import java.util.regex.Pattern;

/*
    This class configures CORS, and specifies which methods are allowed
    along with which origins and headers
    @author: peter.song@oracle.com
 */
@Configuration
public class CorsConfig {
    Logger logger = LoggerFactory.getLogger(CorsConfig.class);
    
    @Bean
    public CorsFilter corsFilter(){
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow localhost for development and ngrok tunnels for local sharing
        config.setAllowedOriginPatterns(List.of(
            "http://localhost:*",
            "https://*.ngrok-free.app",
            "https://*.ngrok-free.dev",
            "https://*.ngrok.io",
            "https://objectstorage.us-phoenix-1.oraclecloud.com",
            "https://petstore.swagger.io"
        ));
        
        // Allow HTTP methods
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        
        // Allow all headers
        config.addAllowedHeader("*");
        
        // Expose headers
        config.addExposedHeader("location");
        config.addExposedHeader("Content-Type");
        
        // Allow credentials
        config.setAllowCredentials(true);
        
        // Register configuration for all paths
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
