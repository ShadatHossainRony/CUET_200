package com.pledgeservice.repository;

import com.pledgeservice.model.Outbox;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OutboxRepository extends MongoRepository<Outbox, String> {
    
    @Query("{ 'published': false }")
    List<Outbox> findUnpublishedEvents();
    
    @Query(value = "{ 'published': false }", sort = "{ 'createdAt': 1 }")
    Optional<Outbox> findFirstUnpublishedEvent();
}