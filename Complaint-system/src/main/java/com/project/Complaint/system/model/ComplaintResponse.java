package com.project.Complaint.system.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ComplaintResponse {

    private Long complaintId;
    private String complaintRef;
    private String title;
    private String description;
    private Long categoryId;
    private String categoryName;
    private String location;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String status;
    private String priority;
    private Integer severityScore;
    private String evidenceImageData;
    private String evidenceFileName;
    private String evidenceContentType;
    private String citizenName;
    private String citizenEmail;

    private Integer slaTargetHours;
    private LocalDateTime slaDeadline;
    private Boolean isEscalated;
    private LocalDateTime escalatedAt;

    private String resolutionNote;
    private LocalDateTime resolvedAt;
    private String resolutionEvidenceImageData;
    private Double resolutionLatitude;
    private Double resolutionLongitude;
    private Integer aiResolutionScore;
    private String aiResolutionNote;

    private String citizenFeedback;
    private Integer feedbackRating;
    private String feedbackComment;

    private String reopenReason;
    private LocalDateTime reopenedAt;
    private Integer reopenCount;

    private Boolean isDuplicate;
    private Long duplicateOfComplaintId;

    private String aiCategoryName;
    private Integer aiSeverityScore;
    private String aiPriority;
    private String aiAnalysisReasoning;
    private Boolean isAiProcessed;

    private String aiCategory;
    private Integer aiSeverity;
    private Boolean aiConfirmed;
    private String detectedLanguage;
    private Long duplicateOfId;

    private String workOrderNumber;
    private String department;
    private Long assignedVendorId;
    private String assignedVendorName;
    private String assignedVendorUsername;
    private String assignedVendorDesignation;
    private String assignmentStatus;
    private LocalDateTime assignedAt;
    private String startEvidenceImageData;
    private String completionEvidenceImageData;
    private Double assignmentLatitude;
    private Double assignmentLongitude;
    private Integer aiVerificationScore;
    private String aiVerificationNote;
    private String assignmentNotes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ComplaintResponse() {}

    public ComplaintResponse(Complaint complaint) {
        this.complaintId = complaint.getComplaintId();
        this.complaintRef = complaint.getComplaintRef() != null ? complaint.getComplaintRef() : "GRV-2026-" + String.format("%06d", complaint.getComplaintId());
        this.title = complaint.getTitle();
        this.description = complaint.getDescription();
        if (complaint.getCategory() != null) {
            this.categoryId = complaint.getCategory().getCategoryId();
            this.categoryName = complaint.getCategory().getCategoryName() != null ? complaint.getCategory().getCategoryName() : complaint.getCategory().getName();
        }
        this.location = complaint.getLocation();
        this.latitude = complaint.getLatitude();
        this.longitude = complaint.getLongitude();
        this.status = complaint.getStatus() != null ? complaint.getStatus().name() : "RECEIVED";
        this.priority = complaint.getPriority() != null ? complaint.getPriority().name() : "MEDIUM";
        this.severityScore = complaint.getSeverityScore();
        this.evidenceImageData = complaint.getEvidenceImageData();
        this.evidenceFileName = complaint.getEvidenceFileName();
        this.evidenceContentType = complaint.getEvidenceContentType();
        if (complaint.getCitizen() != null) {
            this.citizenName = complaint.getCitizen().getFullName() != null ? complaint.getCitizen().getFullName() : complaint.getCitizen().getUsername();
            this.citizenEmail = complaint.getCitizen().getEmail();
        }
        this.slaTargetHours = complaint.getSlaTargetHours();
        this.slaDeadline = complaint.getSlaDeadline();
        this.isEscalated = complaint.getIsEscalated();
        this.escalatedAt = complaint.getEscalatedAt();

        this.resolutionNote = complaint.getResolutionNote();
        this.resolvedAt = complaint.getResolvedAt();
        this.resolutionEvidenceImageData = complaint.getResolutionEvidenceImageData();
        this.resolutionLatitude = complaint.getResolutionLatitude();
        this.resolutionLongitude = complaint.getResolutionLongitude();
        this.aiResolutionScore = complaint.getAiResolutionScore();
        this.aiResolutionNote = complaint.getAiResolutionNote();

        this.citizenFeedback = complaint.getCitizenFeedback();
        this.feedbackRating = complaint.getFeedbackRating();
        this.feedbackComment = complaint.getFeedbackComment();

        this.reopenReason = complaint.getReopenReason();
        this.reopenedAt = complaint.getReopenedAt();
        this.reopenCount = complaint.getReopenCount();

        this.isDuplicate = complaint.getIsDuplicate();
        this.duplicateOfComplaintId = complaint.getDuplicateOfComplaintId();

        this.aiCategoryName = complaint.getAiCategoryName();
        this.aiSeverityScore = complaint.getAiSeverityScore();
        this.aiPriority = complaint.getAiPriority() != null ? complaint.getAiPriority().name() : null;
        this.aiAnalysisReasoning = complaint.getAiAnalysisReasoning();
        this.isAiProcessed = complaint.getIsAiProcessed();

        this.aiCategory = complaint.getAiCategory() != null ? complaint.getAiCategory() : complaint.getAiCategoryName();
        this.aiSeverity = complaint.getAiSeverity() != null ? complaint.getAiSeverity() : complaint.getAiSeverityScore();
        this.aiConfirmed = complaint.getAiConfirmed();
        this.detectedLanguage = complaint.getDetectedLanguage();
        this.duplicateOfId = complaint.getDuplicateOfId() != null ? complaint.getDuplicateOfId() : complaint.getDuplicateOfComplaintId();

        this.createdAt = complaint.getCreatedAt();
        this.updatedAt = complaint.getUpdatedAt();
    }

    // Getters and Setters
    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }

    public String getComplaintRef() { return complaintRef; }
    public void setComplaintRef(String complaintRef) { this.complaintRef = complaintRef; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Integer getSeverityScore() { return severityScore; }
    public void setSeverityScore(Integer severityScore) { this.severityScore = severityScore; }

    public String getEvidenceImageData() { return evidenceImageData; }
    public void setEvidenceImageData(String evidenceImageData) { this.evidenceImageData = evidenceImageData; }

    public String getEvidenceFileName() { return evidenceFileName; }
    public void setEvidenceFileName(String evidenceFileName) { this.evidenceFileName = evidenceFileName; }

    public String getEvidenceContentType() { return evidenceContentType; }
    public void setEvidenceContentType(String evidenceContentType) { this.evidenceContentType = evidenceContentType; }

    public String getCitizenName() { return citizenName; }
    public void setCitizenName(String citizenName) { this.citizenName = citizenName; }

    public String getCitizenEmail() { return citizenEmail; }
    public void setCitizenEmail(String citizenEmail) { this.citizenEmail = citizenEmail; }

    public Integer getSlaTargetHours() { return slaTargetHours; }
    public void setSlaTargetHours(Integer slaTargetHours) { this.slaTargetHours = slaTargetHours; }

    public LocalDateTime getSlaDeadline() { return slaDeadline; }
    public void setSlaDeadline(LocalDateTime slaDeadline) { this.slaDeadline = slaDeadline; }

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

    public String getAiCategoryName() { return aiCategoryName; }
    public void setAiCategoryName(String aiCategoryName) { this.aiCategoryName = aiCategoryName; }

    public Integer getAiSeverityScore() { return aiSeverityScore; }
    public void setAiSeverityScore(Integer aiSeverityScore) { this.aiSeverityScore = aiSeverityScore; }

    public String getAiPriority() { return aiPriority; }
    public void setAiPriority(String aiPriority) { this.aiPriority = aiPriority; }

    public String getAiAnalysisReasoning() { return aiAnalysisReasoning; }
    public void setAiAnalysisReasoning(String aiAnalysisReasoning) { this.aiAnalysisReasoning = aiAnalysisReasoning; }

    public Boolean getIsAiProcessed() { return isAiProcessed; }
    public void setIsAiProcessed(Boolean isAiProcessed) { this.isAiProcessed = isAiProcessed; }

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
    public Double getResolutionLatitude() { return resolutionLatitude; }
    public Double getResolutionLongitude() { return resolutionLongitude; }
    public Integer getAiResolutionScore() { return aiResolutionScore; }
    public String getAiResolutionNote() { return aiResolutionNote; }

    public String getWorkOrderNumber() { return workOrderNumber; }
    public void setWorkOrderNumber(String workOrderNumber) { this.workOrderNumber = workOrderNumber; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Long getAssignedVendorId() { return assignedVendorId; }
    public void setAssignedVendorId(Long assignedVendorId) { this.assignedVendorId = assignedVendorId; }

    public String getAssignedVendorName() { return assignedVendorName; }
    public void setAssignedVendorName(String assignedVendorName) { this.assignedVendorName = assignedVendorName; }

    public String getAssignedVendorUsername() { return assignedVendorUsername; }
    public void setAssignedVendorUsername(String assignedVendorUsername) { this.assignedVendorUsername = assignedVendorUsername; }

    public String getAssignedVendorDesignation() { return assignedVendorDesignation; }
    public void setAssignedVendorDesignation(String assignedVendorDesignation) { this.assignedVendorDesignation = assignedVendorDesignation; }

    public String getAssignmentStatus() { return assignmentStatus; }
    public void setAssignmentStatus(String assignmentStatus) { this.assignmentStatus = assignmentStatus; }

    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }

    public String getStartEvidenceImageData() { return startEvidenceImageData; }
    public void setStartEvidenceImageData(String startEvidenceImageData) { this.startEvidenceImageData = startEvidenceImageData; }

    public String getCompletionEvidenceImageData() { return completionEvidenceImageData; }
    public void setCompletionEvidenceImageData(String completionEvidenceImageData) { this.completionEvidenceImageData = completionEvidenceImageData; }

    public Double getAssignmentLatitude() { return assignmentLatitude; }
    public void setAssignmentLatitude(Double assignmentLatitude) { this.assignmentLatitude = assignmentLatitude; }

    public Double getAssignmentLongitude() { return assignmentLongitude; }
    public void setAssignmentLongitude(Double assignmentLongitude) { this.assignmentLongitude = assignmentLongitude; }

    public Integer getAiVerificationScore() { return aiVerificationScore; }
    public void setAiVerificationScore(Integer aiVerificationScore) { this.aiVerificationScore = aiVerificationScore; }

    public String getAiVerificationNote() { return aiVerificationNote; }
    public void setAiVerificationNote(String aiVerificationNote) { this.aiVerificationNote = aiVerificationNote; }

    public String getAssignmentNotes() { return assignmentNotes; }
    public void setAssignmentNotes(String assignmentNotes) { this.assignmentNotes = assignmentNotes; }
}
