package com.pledgeservice.dto;

import com.pledgeservice.model.Pledge;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

public class CreatePledgeRequest {
    private String userId;
    private String campaignId;
    private BigDecimal amount;
    private String currency;
    private Pledge.Interval interval;
    private Instant startDate;
    private Map<String, Object> paymentMethod;
    private Map<String, Object> metadata;

    // Getters and setters
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
    
    public Map<String, Object> getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(Map<String, Object> paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
}