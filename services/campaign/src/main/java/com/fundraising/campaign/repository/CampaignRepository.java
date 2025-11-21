package com.fundraising.campaign.repository;

import com.fundraising.campaign.domain.Campaign;
import com.fundraising.campaign.domain.CampaignStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Optional;

public interface CampaignRepository extends MongoRepository<Campaign, String> {
    Optional<Campaign> findByCampaignId(String campaignId);
    Optional<Campaign> findBySlug(String slug);
    Page<Campaign> findByStatus(CampaignStatus status, Pageable pageable);
    Page<Campaign> findByOwnerUserId(String ownerUserId, Pageable pageable);
    
    @Query("{ $and: [ " +
           "{ $or: [ { 'title': { $regex: ?0, $options: 'i' } }, { 'description': { $regex: ?0, $options: 'i' } } ] }, " +
           "{ 'status': ?1 } ] }")
    Page<Campaign> findByTextSearchAndStatus(String searchText, CampaignStatus status, Pageable pageable);
}