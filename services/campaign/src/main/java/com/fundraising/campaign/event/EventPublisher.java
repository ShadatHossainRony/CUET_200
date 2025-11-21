package com.fundraising.campaign.event;

import com.fundraising.campaign.domain.Campaign;

public interface EventPublisher {
    void publishCampaignCreated(Campaign campaign);
    void publishCampaignUpdated(Campaign campaign);
}