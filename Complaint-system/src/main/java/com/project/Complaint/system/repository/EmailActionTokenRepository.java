package com.project.Complaint.system.repository;

import com.project.Complaint.system.model.EmailActionToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailActionTokenRepository extends JpaRepository<EmailActionToken, Long> {
    Optional<EmailActionToken> findByToken(String token);
}
