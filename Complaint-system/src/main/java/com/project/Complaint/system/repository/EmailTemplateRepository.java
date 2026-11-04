package com.project.Complaint.system.repository;

import com.project.Complaint.system.model.EmailTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, Long> {
    Optional<EmailTemplate> findByTemplateCode(String templateCode);
    Optional<EmailTemplate> findByTemplateCodeAndLanguage(String templateCode, String language);
}
