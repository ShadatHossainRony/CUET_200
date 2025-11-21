package com.pledgeservice.dto;

import com.pledgeservice.model.Pledge;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

public class PledgeDto {
    private String id;
    private String userId;
    private String campaignId;
    private BigDecimal amount;
    private String currency;
    private Pledge.Interval interval;
    private Instant startDate;
    private Instant nextPaymentDate;
    private Pledge.PledgeStatus status;
    private int failureCount;
    private Map<String, Object> paymentMethod;
    private Map<String, Object> metadata;
    private Instant createdAt;
    private Instant updatedAt;

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getCampaignId() { return campaignId; }
    public void setCampaignId(String campaignId) { this.campaignId = campaignId; }
    
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public Pledge.Interval getInterval() { return interval; }
    public void setInterval(Pledge.Interval interval) { this.interval = interval; }
    
    public Instant getStartDate() { return startDate; }
    public void setStartDate(Instant startDate) { this.startDate = startDate; }
    
    public Instant getNextPaymentDate() { return nextPaymentDate; }
    public void setNextPaymentDate(Instant nextPaymentDate) { this.nextPaymentDate = nextPaymentDate; }
    
    public Pledge.PledgeStatus getStatus() { return status; }
    public void setStatus(Pledge.PledgeStatus status) { this.status = status; }
    
    public int getFailureCount() { return failureCount; }
    public void setFailureCount(int failureCount) { this.failureCount = failureCount; }
    
    public Map<String, Object> getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(Map<String, Object> paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}