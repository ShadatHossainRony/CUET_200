package com.pledgeservice.repository;

import com.pledgeservice.model.Pledge;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;

@Repository
public interface PledgeRepository extends MongoRepository<Pledge, String> {
    
    List<Pledge> findByUserIdOrderByCreatedAtDesc(String userId);
    
    @Query("{ 'status': 'ACTIVE', 'nextPaymentDate': { $lte: ?0 } }")
    List<Pledge> findDuePledges(Instant currentDate);
}