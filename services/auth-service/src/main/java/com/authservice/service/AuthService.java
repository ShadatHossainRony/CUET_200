package com.authservice.service;

import com.authservice.dto.LoginRequest;
import com.authservice.dto.RegisterRequest;
import com.authservice.model.User;
import com.authservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private EventPublisher eventPublisher;

    private final Argon2PasswordEncoder passwordEncoder = new Argon2PasswordEncoder(16, 32, 1, 4096, 3);

    public String registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone already exists");
        }

        User user = new User();
        user.setUserId("u_" + UUID.randomUUID().toString().substring(0, 8));
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRoles(Arrays.asList("USER"));
        user.setStatus("ACTIVE");
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());

        userRepository.save(user);

        // Publish USER_REGISTERED event
        eventPublisher.publishUserRegisteredEvent(user);

        return user.getUserId();
    }

    public String login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        User user = userOpt.get();
        if (!"ACTIVE".equals(user.getStatus())) {
            throw new RuntimeException("User is not active");
        }

        return jwtService.generateToken(user.getUserId(), user.getRoles());
    }

    public boolean verifyToken(String token) {
        try {
            String userId = jwtService.extractUserId(token);
            return jwtService.validateToken(token, userId);
        } catch (Exception e) {
            return false;
        }
    }

    public User getUserByToken(String token) {
        String userId = jwtService.extractUserId(token);
        return userRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("User not found"));
    }
}
