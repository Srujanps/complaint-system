package com.project.Complaint.system.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long complaintId;

    @Column(length = 50, unique = true)
    private String complaintRef;

    @ManyToOne
    @JoinColumn(name = "citizen_id", nullable = false)
    private User citizen;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(length = 255)
    private String location;

    private BigDecimal latitude;
    private BigDecimal longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintStatus status = ComplaintStatus.RECEIVED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority = Priority.MEDIUM;

    private Integer severityScore = 0;

    private String aiCategoryName;
    private Integer aiSeverityScore;

    @Column(name = "ai_category")
    private String aiCategory;

    @Column(name = "ai_severity")
    private Integer aiSeverity;

    @Column(name = "ai_confirmed")
    private Boolean aiConfirmed = false;

    @Column(name = "detected_language")
    private String detectedLanguage;

    @Enumerated(EnumType.STRING)
    private Priority aiPriority;

    @Column(columnDefinition = "TEXT")
    private String aiAnalysisReasoning;

    private Boolean isAiProcessed = false;

    private Boolean evidenceVerified = false;

    @Column(columnDefinition = "TEXT")
    private String evidenceImageData;

    @Column(length = 255)
    private String evidenceFileName;

    @Column(length = 100)
    private String evidenceContentType;

    private Integer slaTargetHours = 48;
    private LocalDateTime slaDeadline;
    private Boolean slaWarningSent = false;
    private Boolean slaBreachSent = false;
    private Boolean isEscalated = false;
    private LocalDateTime escalatedAt;

    @Column(columnDefinition = "TEXT")
    private String resolutionNote;
    private LocalDateTime resolvedAt;

    @Column(columnDefinition = "TEXT")
    private String resolutionEvidenceImageData;

    private Double resolutionLatitude;
    private Double resolutionLongitude;
    private Integer aiResolutionScore;

    @Column(columnDefinition = "TEXT")
    private String aiResolutionNote;

    @Column(length = 20)
    private String citizenFeedback = "PENDING";
    private Integer feedbackRating;
    @Column(columnDefinition = "TEXT")
    private String feedbackComment;

    @Column(columnDefinition = "TEXT")
    private String reopenReason;
    private LocalDateTime reopenedAt;
    private Integer reopenCount = 0;

    private Boolean isDuplicate = false;
    private Long duplicateOfComplaintId;

    @Column(name = "duplicate_of_id")
    private Long duplicateOfId;

    private Double duplicateSimilarityScore;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Complaint() {}

    public Complaint(User citizen, Category category, String title, String description, String location) {
        this.citizen = citizen;
        this.category = category;
        this.title = title;
        this.description = description;
        this.location = location;
        this.status = ComplaintStatus.RECEIVED;
    }

    // Getters and Setters
    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }

    public String getComplaintRef() { return complaintRef; }
    public void setComplaintRef(String complaintRef) { this.complaintRef = complaintRef; }

    public User getCitizen() { return citizen; }
    public void setCitizen(User citizen) { this.citizen = citizen; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public ComplaintStatus getStatus() { return status; }
    public void setStatus(ComplaintStatus status) { this.status = status; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public Integer getSeverityScore() { return severityScore; }
    public void setSeverityScore(Integer severityScore) { this.severityScore = severityScore; }

    public String getAiCategoryName() { return aiCategoryName; }
    public void setAiCategoryName(String aiCategoryName) { this.aiCategoryName = aiCategoryName; }

    public Integer getAiSeverityScore() { return aiSeverityScore; }
    public void setAiSeverityScore(Integer aiSeverityScore) { this.aiSeverityScore = aiSeverityScore; }

    public Priority getAiPriority() { return aiPriority; }
    public void setAiPriority(Priority aiPriority) { this.aiPriority = aiPriority; }

    public String getAiAnalysisReasoning() { return aiAnalysisReasoning; }
    public void setAiAnalysisReasoning(String aiAnalysisReasoning) { this.aiAnalysisReasoning = aiAnalysisReasoning; }

    public Boolean getIsAiProcessed() { return isAiProcessed; }
    public void setIsAiProcessed(Boolean aiProcessed) { isAiProcessed = aiProcessed; }

    public Boolean getEvidenceVerified() { return evidenceVerified; }
    public void setEvidenceVerified(Boolean evidenceVerified) { this.evidenceVerified = evidenceVerified; }

    public String getEvidenceImageData() { return evidenceImageData; }
    public void setEvidenceImageData(String evidenceImageData) { this.evidenceImageData = evidenceImageData; }

    public String getEvidenceFileName() { return evidenceFileName; }
    public void setEvidenceFileName(String evidenceFileName) { this.evidenceFileName = evidenceFileName; }

    public String getEvidenceContentType() { return evidenceContentType; }
    public void setEvidenceContentType(String evidenceContentType) { this.evidenceContentType = evidenceContentType; }

    public Integer getSlaTargetHours() { return slaTargetHours; }
    public void setSlaTargetHours(Integer slaTargetHours) { this.slaTargetHours = slaTargetHours; }

    public LocalDateTime getSlaDeadline() { return slaDeadline; }
    public void setSlaDeadline(LocalDateTime slaDeadline) { this.slaDeadline = slaDeadline; }

    public Boolean getSlaWarningSent() { return slaWarningSent; }
    public void setSlaWarningSent(Boolean slaWarningSent) { this.slaWarningSent = slaWarningSent; }

    public Boolean getSlaBreachSent() { return slaBreachSent; }
    public void setSlaBreachSent(Boolean slaBreachSent) { this.slaBreachSent = slaBreachSent; }

    public Boolean getIsEscalated() { return isEscalated; }
    public void setIsEscalated(Boolean isEscalated) { this.isEscalated = isEscalated; }

    public LocalDateTime getEscalatedAt() { return escalatedAt; }
    public void setEscalatedAt(LocalDateTime escalatedAt) { this.escalatedAt = escalatedAt; }

    public String getResolutionNote() { return resolutionNote; }
    public void setResolutionNote(String resolutionNote) { this.resolutionNote = resolutionNote; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public String getCitizenFeedback() { return citizenFeedback; }
    public void setCitizenFeedback(String citizenFeedback) { this.citizenFeedback = citizenFeedback; }

    public Integer getFeedbackRating() { return feedbackRating; }
    public void setFeedbackRating(Integer feedbackRating) { this.feedbackRating = feedbackRating; }

    public String getFeedbackComment() { return feedbackComment; }
    public void setFeedbackComment(String feedbackComment) { this.feedbackComment = feedbackComment; }

    public String getReopenReason() { return reopenReason; }
    public void setReopenReason(String reopenReason) { this.reopenReason = reopenReason; }

    public LocalDateTime getReopenedAt() { return reopenedAt; }
    public void setReopenedAt(LocalDateTime reopenedAt) { this.reopenedAt = reopenedAt; }

    public Integer getReopenCount() { return reopenCount; }
    public void setReopenCount(Integer reopenCount) { this.reopenCount = reopenCount; }

    public Boolean getIsDuplicate() { return isDuplicate; }
    public void setIsDuplicate(Boolean isDuplicate) { this.isDuplicate = isDuplicate; }

    public Long getDuplicateOfComplaintId() { return duplicateOfComplaintId; }
    public void setDuplicateOfComplaintId(Long duplicateOfComplaintId) { this.duplicateOfComplaintId = duplicateOfComplaintId; }

    public Double getDuplicateSimilarityScore() { return duplicateSimilarityScore; }
    public void setDuplicateSimilarityScore(Double duplicateSimilarityScore) { this.duplicateSimilarityScore = duplicateSimilarityScore; }

    public String getAiCategory() { return aiCategory; }
    public void setAiCategory(String aiCategory) { this.aiCategory = aiCategory; }

    public Integer getAiSeverity() { return aiSeverity; }
    public void setAiSeverity(Integer aiSeverity) { this.aiSeverity = aiSeverity; }

    public Boolean getAiConfirmed() { return aiConfirmed; }
    public void setAiConfirmed(Boolean aiConfirmed) { this.aiConfirmed = aiConfirmed; }

    public String getDetectedLanguage() { return detectedLanguage; }
    public void setDetectedLanguage(String detectedLanguage) { this.detectedLanguage = detectedLanguage; }

    public Long getDuplicateOfId() { return duplicateOfId; }
    public void setDuplicateOfId(Long duplicateOfId) { this.duplicateOfId = duplicateOfId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getResolutionEvidenceImageData() { return resolutionEvidenceImageData; }
    public void setResolutionEvidenceImageData(String resolutionEvidenceImageData) { this.resolutionEvidenceImageData = resolutionEvidenceImageData; }

    public Double getResolutionLatitude() { return resolutionLatitude; }
    public void setResolutionLatitude(Double resolutionLatitude) { this.resolutionLatitude = resolutionLatitude; }

    public Double getResolutionLongitude() { return resolutionLongitude; }
    public void setResolutionLongitude(Double resolutionLongitude) { this.resolutionLongitude = resolutionLongitude; }

    public Integer getAiResolutionScore() { return aiResolutionScore; }
    public void setAiResolutionScore(Integer aiResolutionScore) { this.aiResolutionScore = aiResolutionScore; }

    public String getAiResolutionNote() { return aiResolutionNote; }
    public void setAiResolutionNote(String aiResolutionNote) { this.aiResolutionNote = aiResolutionNote; }
}
