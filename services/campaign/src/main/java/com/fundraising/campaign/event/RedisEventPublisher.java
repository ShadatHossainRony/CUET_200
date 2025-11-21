package com.fundraising.campaign.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fundraising.campaign.domain.Campaign;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class RedisEventPublisher implements EventPublisher {
    private static final Logger logger = LoggerFactory.getLogger(RedisEventPublisher.class);
    
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final String streamKey;

    public RedisEventPublisher(
            RedisTemplate<String, String> redisTemplate,
            ObjectMapper objectMapper,
            @Value("${event.redis.stream-key}") String streamKey) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.streamKey = streamKey;
    }

    @Override
    public void publishCampaignCreated(Campaign campaign) {
        publishEvent("CAMPAIGN_CREATED", campaign);
    }

    @Override
    public void publishCampaignUpdated(Campaign campaign) {
        publishEvent("CAMPAIGN_UPDATED", campaign);
    }

    private void publishEvent(String eventType, Campaign campaign) {
        try {
            Map<String, Object> event = createEvent(eventType, campaign);
            String eventJson = objectMapper.writeValueAsString(event);
            
            redisTemplate.opsForStream().add(streamKey, Map.of("event", eventJson));
            logger.info("Published event {} for campaign {}", eventType, campaign.getCampaignId());
        } catch (Exception e) {
            logger.error("Failed to publish event {} for campaign {}", eventType, campaign.getCampaignId(), e);
        }
    }

    private Map<String, Object> createEvent(String eventType, Campaign campaign) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("campaignId", campaign.getCampaignId());
        payload.put("title", campaign.getTitle());
        payload.put("goalAmountCents", campaign.getGoalAmountCents());
        payload.put("currency", campaign.getCurrency());
        payload.put("ownerUserId", campaign.getOwnerUserId());
        payload.put("startDate", campaign.getStartDate());
        payload.put("endDate", campaign.getEndDate());
        payload.put("status", campaign.getStatus());
        payload.put("metadata", campaign.getMetadata());

        Map<String, Object> event = new HashMap<>();
        event.put("event_id", UUID.randomUUID().toString());
        event.put("event_type", eventType);
        event.put("occurred_at", Instant.now().toString());
        event.put("source_service", "campaign-service");
        event.put("correlation_id", UUID.randomUUID().toString());
        event.put("payload", payload);

        return event;
    }
}