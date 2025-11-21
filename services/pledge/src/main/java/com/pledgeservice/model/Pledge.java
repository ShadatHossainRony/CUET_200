package com.pledgeservice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

@Document("pledges")
public class Pledge {
    @Id
    private String id;
    private String userId;
    private String campaignId;
    private BigDecimal amount;
    private String currency;
    private Interval interval;
    private Instant startDate;
    private Instant nextPaymentDate;
    private PledgeStatus status;
    private int failureCount;
    private Map<String, Object> paymentMethod;
    private Map<String, Object> metadata;
    private Instant createdAt;
    private Instant updatedAt;

    public enum Interval {
        DAILY, WEEKLY, MONTHLY, YEARLY
    }

    public enum PledgeStatus {
        ACTIVE, CANCELLED, SUSPENDED, COMPLETED
    }

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
    
    public Interval getInterval() { return interval; }
    public void setInterval(Interval interval) { this.interval = interval; }
    
    public Instant getStartDate() { return startDate; }
    public void setStartDate(Instant startDate) { this.startDate = startDate; }
    
    public Instant getNextPaymentDate() { return nextPaymentDate; }
    public void setNextPaymentDate(Instant nextPaymentDate) { this.nextPaymentDate = nextPaymentDate; }
    
    public PledgeStatus getStatus() { return status; }
    public void setStatus(PledgeStatus status) { this.status = status; }
    
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