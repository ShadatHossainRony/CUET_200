package com.pledgeservice.service;

import com.pledgeservice.model.Outbox;
import com.pledgeservice.model.Pledge;
import com.pledgeservice.repository.OutboxRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class OutboxService {
    
    @Autowired
    private OutboxRepository outboxRepository;

    public void createPledgeCreatedEvent(Pledge pledge) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("eventType", "PLEDGE_CREATED");
        payload.put("occurredAt", Instant.now().toString());
        
        Map<String, Object> pledgeData = new HashMap<>();
        pledgeData.put("id", pledge.getId());
        pledgeData.put("userId", pledge.getUserId());
        pledgeData.put("campaignId", pledge.getCampaignId());
        pledgeData.put("amount", pledge.getAmount());
        pledgeData.put("interval", pledge.getInterval().toString());
        pledgeData.put("nextPaymentDate", pledge.getNextPaymentDate().toString());
        
        payload.put("pledge", pledgeData);
        
        createOutboxEvent("PLEDGE", pledge.getId(), "PLEDGE_CREATED", payload);
    }

    public void createPledgePaymentDueEvent(Pledge pledge) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("eventType", "PLEDGE_PAYMENT_DUE");
        payload.put("occurredAt", Instant.now().toString());
        payload.put("pledgeId", pledge.getId());
        payload.put("userId", pledge.getUserId());
        payload.put("amount", pledge.getAmount());
        payload.put("currency", pledge.getCurrency());
        payload.put("paymentMethodRef", pledge.getPaymentMethod().get("reference"));
        
        createOutboxEvent("PLEDGE", pledge.getId(), "PLEDGE_PAYMENT_DUE", payload);
    }

    public void createPledgePaymentSuccessEvent(Pledge pledge) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("eventType", "PLEDGE_PAYMENT_SUCCESS");
        payload.put("occurredAt", Instant.now().toString());
        payload.put("pledgeId", pledge.getId());
        payload.put("userId", pledge.getUserId());
        
        createOutboxEvent("PLEDGE", pledge.getId(), "PLEDGE_PAYMENT_SUCCESS", payload);
    }

    public void createPledgePaymentFailedEvent(Pledge pledge) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("eventType", "PLEDGE_PAYMENT_FAILED");
        payload.put("occurredAt", Instant.now().toString());
        payload.put("pledgeId", pledge.getId());
        payload.put("userId", pledge.getUserId());
        payload.put("failureCount", pledge.getFailureCount());
        
        createOutboxEvent("PLEDGE", pledge.getId(), "PLEDGE_PAYMENT_FAILED", payload);
    }

    public void createPledgeCancelledEvent(Pledge pledge) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("eventType", "PLEDGE_CANCELLED");
        payload.put("occurredAt", Instant.now().toString());
        payload.put("pledgeId", pledge.getId());
        payload.put("userId", pledge.getUserId());
        
        createOutboxEvent("PLEDGE", pledge.getId(), "PLEDGE_CANCELLED", payload);
    }

    public void createNotificationRequiredEvent(Pledge pledge) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("eventType", "NOTIFICATION_REQUIRED");
        payload.put("occurredAt", Instant.now().toString());
        payload.put("pledgeId", pledge.getId());
        payload.put("userId", pledge.getUserId());
        payload.put("reason", "PLEDGE_SUSPENDED_AFTER_FAILURES");
        
        createOutboxEvent("PLEDGE", pledge.getId(), "NOTIFICATION_REQUIRED", payload);
    }

    private void createOutboxEvent(String aggregateType, String aggregateId, String eventType, Map<String, Object> payload) {
        Outbox outbox = new Outbox();
        outbox.setId(UUID.randomUUID().toString());
        outbox.setAggregateType(aggregateType);
        outbox.setAggregateId(aggregateId);
        outbox.setEventType(eventType);
        outbox.setPayload(payload);
        outbox.setCreatedAt(Instant.now());
        outbox.setPublished(false);
        outbox.setAttempts(0);
        
        outboxRepository.save(outbox);
    }
}