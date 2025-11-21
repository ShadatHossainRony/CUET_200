package com.pledgeservice.service;

import com.pledgeservice.dto.CreatePledgeRequest;
import com.pledgeservice.dto.PledgeDto;
import com.pledgeservice.model.Pledge;
import com.pledgeservice.repository.PledgeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PledgeService {
    
    @Autowired
    private PledgeRepository pledgeRepository;
    
    @Autowired
    private OutboxService outboxService;

    public PledgeDto createRecurring(CreatePledgeRequest request) {
        Pledge pledge = new Pledge();
        pledge.setUserId(request.getUserId());
        pledge.setCampaignId(request.getCampaignId());
        pledge.setAmount(request.getAmount());
        pledge.setCurrency(request.getCurrency());
        pledge.setInterval(request.getInterval());
        pledge.setStartDate(request.getStartDate());
        pledge.setNextPaymentDate(calculateNextPaymentDate(request.getStartDate(), request.getInterval()));
        pledge.setStatus(Pledge.PledgeStatus.ACTIVE);
        pledge.setFailureCount(0);
        pledge.setPaymentMethod(request.getPaymentMethod());
        pledge.setMetadata(request.getMetadata());
        pledge.setCreatedAt(Instant.now());
        pledge.setUpdatedAt(Instant.now());

        pledge = pledgeRepository.save(pledge);
        outboxService.createPledgeCreatedEvent(pledge);
        
        return convertToDto(pledge);
    }

    public PledgeDto getPledge(String id) {
        Pledge pledge = pledgeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pledge not found"));
        return convertToDto(pledge);
    }

    public List<PledgeDto> getUserPledgeHistory(String userId) {
        return pledgeRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    public void cancelPledge(String id) {
        Pledge pledge = pledgeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pledge not found"));
        
        pledge.setStatus(Pledge.PledgeStatus.CANCELLED);
        pledge.setUpdatedAt(Instant.now());
        
        pledgeRepository.save(pledge);
        outboxService.createPledgeCancelledEvent(pledge);
    }

    public void updatePledgeAfterPayment(String pledgeId, boolean success) {
        if (pledgeId == null) throw new RuntimeException("Pledge ID cannot be null");
        Pledge pledge = pledgeRepository.findById(pledgeId)
            .orElseThrow(() -> new RuntimeException("Pledge not found"));

        if (success) {
            pledge.setNextPaymentDate(calculateNextPaymentDate(pledge.getNextPaymentDate(), pledge.getInterval()));
            pledge.setFailureCount(0);
            outboxService.createPledgePaymentSuccessEvent(pledge);
        } else {
            pledge.setFailureCount(pledge.getFailureCount() + 1);
            if (pledge.getFailureCount() >= 3) {
                pledge.setStatus(Pledge.PledgeStatus.SUSPENDED);
                outboxService.createNotificationRequiredEvent(pledge);
            }
            outboxService.createPledgePaymentFailedEvent(pledge);
        }
        
        pledge.setUpdatedAt(Instant.now());
        pledgeRepository.save(pledge);
    }

    private Instant calculateNextPaymentDate(Instant currentDate, Pledge.Interval interval) {
        if (currentDate == null || interval == null) return Instant.now();
        return switch (interval) {
            case DAILY -> currentDate.plus(1, ChronoUnit.DAYS);
            case WEEKLY -> currentDate.plus(7, ChronoUnit.DAYS);
            case MONTHLY -> currentDate.plus(30, ChronoUnit.DAYS);
            case YEARLY -> currentDate.plus(365, ChronoUnit.DAYS);
        };
    }

    private PledgeDto convertToDto(Pledge pledge) {
        PledgeDto dto = new PledgeDto();
        dto.setId(pledge.getId());
        dto.setUserId(pledge.getUserId());
        dto.setCampaignId(pledge.getCampaignId());
        dto.setAmount(pledge.getAmount());
        dto.setCurrency(pledge.getCurrency());
        dto.setInterval(pledge.getInterval());
        dto.setStartDate(pledge.getStartDate());
        dto.setNextPaymentDate(pledge.getNextPaymentDate());
        dto.setStatus(pledge.getStatus());
        dto.setFailureCount(pledge.getFailureCount());
        dto.setPaymentMethod(pledge.getPaymentMethod());
        dto.setMetadata(pledge.getMetadata());
        dto.setCreatedAt(pledge.getCreatedAt());
        dto.setUpdatedAt(pledge.getUpdatedAt());
        return dto;
    }
}