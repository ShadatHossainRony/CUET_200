package com.pledgeservice.controller;

import com.pledgeservice.model.WebhookEvent;
import com.pledgeservice.repository.WebhookEventRepository;
import com.pledgeservice.service.PledgeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/pledges")
public class WebhookController {
    
    @Autowired
    private PledgeService pledgeService;
    
    @Autowired
    private WebhookEventRepository webhookEventRepository;

    @PostMapping("/payment_webhook")
    public ResponseEntity<Void> handlePaymentWebhook(@RequestBody Map<String, Object> payload) {
        String pledgeId = (String) payload.get("pledgeId");
        String status = (String) payload.get("status");
        String eventId = (String) payload.get("eventId");
        
        if (pledgeId == null || status == null || eventId == null) {
            return ResponseEntity.badRequest().build();
        }
        
        String nonNullEventId = Objects.requireNonNull(eventId);
        String nonNullPledgeId = Objects.requireNonNull(pledgeId);
        String nonNullStatus = Objects.requireNonNull(status);
        
        if (webhookEventRepository.existsById(nonNullEventId)) {
            return ResponseEntity.ok().build();
        }
        
        boolean success = "SUCCESS".equals(nonNullStatus);
        pledgeService.updatePledgeAfterPayment(nonNullPledgeId, success);
        
        WebhookEvent event = new WebhookEvent();
        event.setEventId(nonNullEventId);
        event.setPledgeId(nonNullPledgeId);
        event.setStatus(nonNullStatus);
        event.setProcessedAt(Instant.now());
        webhookEventRepository.save(event);
        
        return ResponseEntity.ok().build();
    }
}