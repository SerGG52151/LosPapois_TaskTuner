package com.springboot.MyTodoList.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import com.springboot.MyTodoList.security.ApiSecurityFilter;
import org.springframework.web.bind.annotation.RequestBody;
import com.springboot.MyTodoList.security.ApiSecurityFilter;
import org.springframework.web.bind.annotation.RequestMapping;
import com.springboot.MyTodoList.security.ApiSecurityFilter;
import org.springframework.web.bind.annotation.RestController;
import com.springboot.MyTodoList.security.ApiSecurityFilter;

import com.springboot.MyTodoList.dto.LoginRequest;
import com.springboot.MyTodoList.dto.RegisterRequest;
import com.springboot.MyTodoList.model.UserTT;
import com.springboot.MyTodoList.service.UserTTService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserTTService userTTService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        Optional<UserTT> optionalUser = userTTService.login(req);
        if (optionalUser.isPresent()) {
            UserTT u = optionalUser.get();
            String token = java.util.UUID.randomUUID().toString();
            com.springboot.MyTodoList.security.ApiSecurityFilter.VALID_TOKENS.add(token);
            
            return ResponseEntity.ok(Map.of(
                "token", token,
                "userId", u.getUserId(),
                "nameUser", u.getNameUser(),
                "mail", u.getMail() != null ? u.getMail() : "",
                "role", u.getRole(),
                "idTelegram", u.getIdTelegram()
            ));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Correo o contraseña incorrectos."));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        try {
            UserTT created = userTTService.register(req);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
