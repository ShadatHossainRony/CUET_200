package com.authservice.repository;

import com.authservice.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUserId(String userId);
    Optional<User> findByPhone(String phone);
    boolean existsByEmail(String email);
    boolean existsByUserId(String userId);
    boolean existsByPhone(String phone);
}
