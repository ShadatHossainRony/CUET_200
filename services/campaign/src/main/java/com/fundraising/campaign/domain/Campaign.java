package com.fundraising.campaign.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Document(collection = "campaigns")
public class Campaign {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String campaignId;
    
    private String title;
    
    @Indexed(unique = true)
    private String slug;
    
    private String description;
    private Long goalAmountCents;
    private Long collectedAmountCents;
    private String currency;
    
    @Indexed
    private String ownerUserId;
    
    @Indexed
    private CampaignStatus status;
    
    private List<String> tags;
    private Boolean visible;
    private Instant startDate;
    
    @Indexed
    private Instant endDate;
    
    private Instant createdAt;
    private Instant updatedAt;
    private Map<String, Object> metadata;

    public Campaign() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCampaignId() { return campaignId; }
    public void setCampaignId(String campaignId) { this.campaignId = campaignId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getGoalAmountCents() { return goalAmountCents; }
    public void setGoalAmountCents(Long goalAmountCents) { this.goalAmountCents = goalAmountCents; }

    public Long getCollectedAmountCents() { return collectedAmountCents; }
    public void setCollectedAmountCents(Long collectedAmountCents) { this.collectedAmountCents = collectedAmountCents; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getOwnerUserId() { return ownerUserId; }
    public void setOwnerUserId(String ownerUserId) { this.ownerUserId = ownerUserId; }

    public CampaignStatus getStatus() { return status; }
    public void setStatus(CampaignStatus status) { this.status = status; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public Boolean getVisible() { return visible; }
    public void setVisible(Boolean visible) { this.visible = visible; }

    public Instant getStartDate() { return startDate; }
    public void setStartDate(Instant startDate) { this.startDate = startDate; }

    public Instant getEndDate() { return endDate; }
    public void setEndDate(Instant endDate) { this.endDate = endDate; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
}