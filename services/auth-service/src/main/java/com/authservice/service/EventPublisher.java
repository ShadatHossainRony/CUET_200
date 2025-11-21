package com.authservice.service;

import com.authservice.model.User;
import org.springframework.stereotype.Service;

@Service
public class EventPublisher {

    public void publishUserRegisteredEvent(User user) {
        // Event publishing logic would go here
        // For now, this is a placeholder implementation
        System.out.println("User registered event published for user: " + user.getUserId());
    }
}