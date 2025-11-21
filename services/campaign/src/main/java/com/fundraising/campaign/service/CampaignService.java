package com.fundraising.campaign.service;

import com.fundraising.campaign.domain.Campaign;
import com.fundraising.campaign.domain.CampaignStatus;
import com.fundraising.campaign.dto.CreateCampaignRequest;
import com.fundraising.campaign.dto.UpdateCampaignRequest;
import com.fundraising.campaign.event.EventPublisher;
import com.fundraising.campaign.repository.CampaignRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class CampaignService {
    private final CampaignRepository campaignRepository;
    private final EventPublisher eventPublisher;

    public CampaignService(CampaignRepository campaignRepository, EventPublisher eventPublisher) {
        this.campaignRepository = campaignRepository;
        this.eventPublisher = eventPublisher;
    }

    public Campaign createCampaign(CreateCampaignRequest request, String userId) {
        Campaign campaign = new Campaign();
        campaign.setCampaignId("c_" + UUID.randomUUID().toString().replace("-", ""));
        campaign.setTitle(request.getTitle());
        campaign.setSlug(generateSlug(request.getTitle()));
        campaign.setDescription(request.getDescription());
        campaign.setGoalAmountCents(request.getGoalAmountCents());
        campaign.setCollectedAmountCents(0L);
        campaign.setCurrency(request.getCurrency());
        campaign.setOwnerUserId(userId);
        campaign.setStatus(CampaignStatus.ACTIVE);
        campaign.setTags(request.getTags());
        campaign.setVisible(request.getVisible());
        campaign.setStartDate(request.getStartDate());
        campaign.setEndDate(request.getEndDate());
        campaign.setCreatedAt(Instant.now());
        campaign.setUpdatedAt(Instant.now());
        campaign.setMetadata(request.getMetadata());

        Campaign saved = campaignRepository.save(campaign);
        eventPublisher.publishCampaignCreated(saved);
        return saved;
    }

    public Campaign getCampaign(String campaignId) {
        return campaignRepository.findByCampaignId(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found: " + campaignId));
    }

    public Page<Campaign> listCampaigns(Pageable pageable, CampaignStatus status, String searchText, String ownerId) {
        if (ownerId != null) {
            return campaignRepository.findByOwnerUserId(ownerId, pageable);
        }
        if (searchText != null && status != null) {
            return campaignRepository.findByTextSearchAndStatus(searchText, status, pageable);
        }
        if (status != null) {
            return campaignRepository.findByStatus(status, pageable);
        }
        return campaignRepository.findAll(pageable);
    }

    public Campaign updateCampaign(String campaignId, UpdateCampaignRequest request, String userId) {
        Campaign campaign = getCampaign(campaignId);
        
        if (!campaign.getOwnerUserId().equals(userId)) {
            throw new RuntimeException("Not authorized to update this campaign");
        }

        if (campaign.getStatus() == CampaignStatus.COMPLETED && request.getStatus() == CampaignStatus.ACTIVE) {
            throw new RuntimeException("Cannot reactivate completed campaign");
        }

        if (request.getTitle() != null) campaign.setTitle(request.getTitle());
        if (request.getDescription() != null) campaign.setDescription(request.getDescription());
        if (request.getStatus() != null) campaign.setStatus(request.getStatus());
        if (request.getTags() != null) campaign.setTags(request.getTags());
        if (request.getVisible() != null) campaign.setVisible(request.getVisible());
        if (request.getEndDate() != null) campaign.setEndDate(request.getEndDate());
        if (request.getMetadata() != null) campaign.setMetadata(request.getMetadata());
        
        campaign.setUpdatedAt(Instant.now());

        Campaign updated = campaignRepository.save(campaign);
        eventPublisher.publishCampaignUpdated(updated);
        return updated;
    }

    private String generateSlug(String title) {
        return title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }
}