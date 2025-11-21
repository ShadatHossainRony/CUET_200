package com.pledgeservice.service;

import com.pledgeservice.model.Pledge;
import com.pledgeservice.repository.PledgeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.Instant;
import java.util.List;

@Component
public class PaymentScheduler {
    
    @Autowired
    private PledgeRepository pledgeRepository;
    
    @Autowired
    private OutboxService outboxService;

    @Scheduled(cron = "0 0 0 * * *") // Daily at midnight
    public void processRecurringPayments() {
        List<Pledge> duePledges = pledgeRepository.findDuePledges(Instant.now());
        
        for (Pledge pledge : duePledges) {
            try {
                // Create payment due event
                outboxService.createPledgePaymentDueEvent(pledge);
                
                // Log for monitoring
                System.out.println("Enqueued payment for pledge: " + pledge.getId());
                
            } catch (Exception e) {
                System.err.println("Failed to enqueue payment for pledge " + pledge.getId() + ": " + e.getMessage());
            }
        }
        
        System.out.println("Processed " + duePledges.size() + " due pledges");
    }
}