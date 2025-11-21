package com.authservice.controller;

import com.authservice.dto.LoginRequest;
import com.authservice.dto.RegisterRequest;
import com.authservice.model.User;
import com.authservice.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            String userId = authService.registerUser(request);
            return ResponseEntity.ok(Map.of("userId", userId, "message", "User registered successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            String token = authService.login(request);
            return ResponseEntity.ok(Map.of("token", token, "message", "Login successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            boolean isValid = authService.verifyToken(token);
            return ResponseEntity.ok(Map.of("valid", isValid));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            User user = authService.getUserByToken(token);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}