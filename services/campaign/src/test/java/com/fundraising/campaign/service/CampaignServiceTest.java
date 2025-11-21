package com.fundraising.campaign.service;

import com.fundraising.campaign.domain.Campaign;
import com.fundraising.campaign.dto.CreateCampaignRequest;
import com.fundraising.campaign.event.EventPublisher;
import com.fundraising.campaign.repository.CampaignRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

// import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CampaignServiceTest {

    @Mock
    private CampaignRepository campaignRepository;

    @Mock
    private EventPublisher eventPublisher;

    @InjectMocks
    private CampaignService campaignService;

    @Test
    void createCampaign_ShouldCreateAndPublishEvent() {
        CreateCampaignRequest request = new CreateCampaignRequest();
        request.setTitle("Test Campaign");
        request.setDescription("Test Description");
        request.setGoalAmountCents(100000L);
        request.setCurrency("BDT");

        Campaign savedCampaign = new Campaign();
        savedCampaign.setCampaignId("c_123");
        savedCampaign.setTitle("Test Campaign");

        when(campaignRepository.save(any(Campaign.class))).thenReturn(savedCampaign);

        Campaign result = campaignService.createCampaign(request, "user123");

        assertNotNull(result);
        assertEquals("Test Campaign", result.getTitle());
        verify(campaignRepository).save(any(Campaign.class));
        verify(eventPublisher).publishCampaignCreated(savedCampaign);
    }
}