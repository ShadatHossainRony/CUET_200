package com.pledgeservice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document("webhook_events")
public class WebhookEvent {
    @Id
    private String eventId;
    private String pledgeId;
    private String status;
    private Instant processedAt;

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
    
    public String getPledgeId() { return pledgeId; }
    public void setPledgeId(String pledgeId) { this.pledgeId = pledgeId; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public Instant getProcessedAt() { return processedAt; }
    public void setProcessedAt(Instant processedAt) { this.processedAt = processedAt; }
}