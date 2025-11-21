package com.fundraising.campaign.dto;

import jakarta.validation.constraints.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public class CreateCampaignRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;

    @NotNull(message = "Goal amount is required")
    @Positive(message = "Goal amount must be positive")
    private Long goalAmountCents;

    @NotBlank(message = "Currency is required")
    @Pattern(regexp = "^[A-Z]{3}$", message = "Currency must be a valid 3-letter code")
    private String currency;

    private List<String> tags;
    private Boolean visible = true;

    @Future(message = "Start date must be in the future")
    private Instant startDate;

    @Future(message = "End date must be in the future")
    private Instant endDate;

    private Map<String, Object> metadata;

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getGoalAmountCents() { return goalAmountCents; }
    public void setGoalAmountCents(Long goalAmountCents) { this.goalAmountCents = goalAmountCents; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public Boolean getVisible() { return visible; }
    public void setVisible(Boolean visible) { this.visible = visible; }

    public Instant getStartDate() { return startDate; }
    public void setStartDate(Instant startDate) { this.startDate = startDate; }

    public Instant getEndDate() { return endDate; }
    public void setEndDate(Instant endDate) { this.endDate = endDate; }

    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
}