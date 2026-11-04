package com.project.Complaint.system.model;

import jakarta.persistence.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_templates")
public class EmailTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String templateCode;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 255)
    private String subjectTemplate;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String bodyTemplateHtml;

    @Column(columnDefinition = "TEXT")
    private String bodyTemplateText;

    @Column(length = 10, nullable = false)
    private String language = "EN";

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public EmailTemplate() {}

    public EmailTemplate(Long id, String templateCode, String name, String subjectTemplate, String bodyTemplateHtml, String bodyTemplateText, String language, LocalDateTime updatedAt) {
        this.id = id;
        this.templateCode = templateCode;
        this.name = name;
        this.subjectTemplate = subjectTemplate;
        this.bodyTemplateHtml = bodyTemplateHtml;
        this.bodyTemplateText = bodyTemplateText;
        this.language = language;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTemplateCode() { return templateCode; }
    public void setTemplateCode(String templateCode) { this.templateCode = templateCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSubjectTemplate() { return subjectTemplate; }
    public void setSubjectTemplate(String subjectTemplate) { this.subjectTemplate = subjectTemplate; }

    public String getBodyTemplateHtml() { return bodyTemplateHtml; }
    public void setBodyTemplateHtml(String bodyTemplateHtml) { this.bodyTemplateHtml = bodyTemplateHtml; }

    public String getBodyTemplateText() { return bodyTemplateText; }
    public void setBodyTemplateText(String bodyTemplateText) { this.bodyTemplateText = bodyTemplateText; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
