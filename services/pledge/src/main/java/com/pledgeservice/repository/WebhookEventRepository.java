package com.pledgeservice.repository;

import com.pledgeservice.model.WebhookEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WebhookEventRepository extends MongoRepository<WebhookEvent, String> {
}