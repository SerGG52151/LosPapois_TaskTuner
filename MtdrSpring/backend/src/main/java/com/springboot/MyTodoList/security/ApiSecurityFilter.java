package com.springboot.MyTodoList.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ApiSecurityFilter extends OncePerRequestFilter {

    // Simple in-memory token store for prototype auth
    public static final Set<String> VALID_TOKENS = Collections.newSetFromMap(new ConcurrentHashMap<>());

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // 1. Target all API requests except Auth and OPTIONS preflight
        if (path.startsWith("/api/") && !path.startsWith("/api/auth/")) {
            
            if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
                filterChain.doFilter(request, response);
                return;
            }

            // 2. Block direct browser navigation to prevent JSON DB dump
            String secFetchMode = request.getHeader("Sec-Fetch-Mode");
            String accept = request.getHeader("Accept");
            
            if ("navigate".equals(secFetchMode) || (accept != null && accept.contains("text/html"))) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Direct browsing of secured API endpoints is blocked.");
                return;
            }

            // 3. Token Authentication
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing Authorization Token");
                return;
            }

            String token = authHeader.substring(7); // Remove "Bearer "
            if (!VALID_TOKENS.contains(token)) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid Token");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
