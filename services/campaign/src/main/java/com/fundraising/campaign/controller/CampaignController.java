package com.fundraising.campaign.controller;

import com.fundraising.campaign.domain.Campaign;
import com.fundraising.campaign.domain.CampaignStatus;
import com.fundraising.campaign.dto.CampaignResponse;
import com.fundraising.campaign.dto.CreateCampaignRequest;
import com.fundraising.campaign.dto.UpdateCampaignRequest;
import com.fundraising.campaign.service.CampaignService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/campaigns")
public class CampaignController {
    private final CampaignService campaignService;

    public CampaignController(CampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CampaignResponse createCampaign(
            @Valid @RequestBody CreateCampaignRequest request,
            @RequestHeader("X-User-Id") String userId) {
        Campaign campaign = campaignService.createCampaign(request, userId);
        return mapToResponse(campaign);
    }

    @GetMapping
    public Page<CampaignResponse> listCampaigns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) CampaignStatus status,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String ownerId) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Campaign> campaigns = campaignService.listCampaigns(pageable, status, q, ownerId);
        return campaigns.map(this::mapToResponse);
    }

    @GetMapping("/{id}")
    public CampaignResponse getCampaign(@PathVariable String id) {
        Campaign campaign = campaignService.getCampaign(id);
        return mapToResponse(campaign);
    }

    @PutMapping("/{id}")
    public CampaignResponse updateCampaign(
            @PathVariable String id,
            @Valid @RequestBody UpdateCampaignRequest request,
            @RequestHeader("X-User-Id") String userId) {
        Campaign campaign = campaignService.updateCampaign(id, request, userId);
        return mapToResponse(campaign);
    }

    private CampaignResponse mapToResponse(Campaign campaign) {
        CampaignResponse response = new CampaignResponse();
        response.setCampaignId(campaign.getCampaignId());
        response.setTitle(campaign.getTitle());
        response.setSlug(campaign.getSlug());
        response.setDescription(campaign.getDescription());
        response.setGoalAmountCents(campaign.getGoalAmountCents());
        response.setCollectedAmountCents(campaign.getCollectedAmountCents());
        response.setCurrency(campaign.getCurrency());
        response.setOwnerUserId(campaign.getOwnerUserId());
        response.setStatus(campaign.getStatus());
        response.setTags(campaign.getTags());
        response.setVisible(campaign.getVisible());
        response.setStartDate(campaign.getStartDate());
        response.setEndDate(campaign.getEndDate());
        response.setCreatedAt(campaign.getCreatedAt());
        response.setUpdatedAt(campaign.getUpdatedAt());
        response.setMetadata(campaign.getMetadata());
        return response;
    }
}