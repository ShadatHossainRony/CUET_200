package com.pledgeservice.service;

import com.pledgeservice.model.Outbox;
import com.pledgeservice.repository.OutboxRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.Instant;
import java.util.Optional;

@Component
public class OutboxPublisher {
    
    @Autowired
    private OutboxRepository outboxRepository;
    
    @Autowired(required = false)
    private RedisTemplate<String, String> redisTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;

    @Scheduled(fixedDelay = 1000)
    public void publishEvents() {
        if (redisTemplate == null) return;
        
        Optional<Outbox> outboxOpt = outboxRepository.findFirstUnpublishedEvent();
        
        if (outboxOpt.isPresent()) {
            Outbox outbox = outboxOpt.get();
            try {
                String eventJson = objectMapper.writeValueAsString(outbox.getPayload());
                String eventType = outbox.getEventType();
                String queueName = getQueueName(eventType != null ? eventType : "UNKNOWN");
                redisTemplate.opsForList().leftPush(queueName, eventJson);
                
                outbox.setPublished(true);
                outbox.setPublishedAt(Instant.now());
                outboxRepository.save(outbox);
                
            } catch (Exception e) {
                outbox.incrementAttempts();
                outboxRepository.save(outbox);
            }
        }
    }

    private String getQueueName(String eventType) {
        if (eventType == null) return "pledge-events";
        return switch (eventType) {
            case "PLEDGE_PAYMENT_DUE" -> "recurring-payments";
            case "PLEDGE_PAYMENT_FAILED" -> "payment-retries";
            case "NOTIFICATION_REQUIRED" -> "notifications";
            default -> "pledge-events";
        };
    }
}