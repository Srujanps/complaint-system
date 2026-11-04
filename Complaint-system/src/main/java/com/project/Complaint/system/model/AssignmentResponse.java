package com.project.Complaint.system.model;

import java.time.LocalDateTime;

public class AssignmentResponse {

    private Long assignmentId;
    private String workOrderNumber;
    private Long complaintId;
    private String complaintRef;
    private String complaintTitle;
    private String complaintDescription;
    private String categoryName;
    private String location;
    private String priority;
    private Integer severityScore;
    private String evidenceImageData;
    private String evidenceFileName;
    private String evidenceContentType;
    private Long vendorId;
    private String vendorName;
    private String vendorUsername;
    private String vendorPhone;
    private String assignedByName;
    private String status;
    private String notes;
    private LocalDateTime assignedAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime rejectedAt;
    private String rejectionReason;
    private LocalDateTime completedAt;

    private String startEvidenceImageData;
    private String completionEvidenceImageData;
    private Double latitude;
    private Double longitude;
    private Integer aiVerificationScore;
    private String aiVerificationNote;

    private Long contractId;
    private String contractNumber;
    private String department;
    private String departmentRequirements;
    private String workInstructions;
    private Integer estimatedHours;
    private LocalDateTime slaDeadline;

    private LocalDateTime verifiedAt;
    private String verificationStatus;
    private String verificationRemarks;

    private Integer feedbackRating;
    private String feedbackComment;

    // Constructor
    public AssignmentResponse(Assignment assignment) {
        this.assignmentId = assignment.getAssignmentId();
        this.workOrderNumber = assignment.getWorkOrderNumber();
        if (assignment.getComplaint() != null) {
            this.complaintId = assignment.getComplaint().getComplaintId();
            this.complaintRef = assignment.getComplaint().getComplaintRef();
            this.complaintTitle = assignment.getComplaint().getTitle();
            this.complaintDescription = assignment.getComplaint().getDescription();
            this.categoryName = assignment.getComplaint().getCategory() != null ? assignment.getComplaint().getCategory().getName() : null;
            this.location = assignment.getComplaint().getLocation();
            this.priority = assignment.getComplaint().getPriority() != null ? assignment.getComplaint().getPriority().name() : "MEDIUM";
            this.severityScore = assignment.getComplaint().getSeverityScore();
            this.evidenceImageData = assignment.getComplaint().getEvidenceImageData();
            this.evidenceFileName = assignment.getComplaint().getEvidenceFileName();
            this.evidenceContentType = assignment.getComplaint().getEvidenceContentType();
            this.feedbackRating = assignment.getComplaint().getFeedbackRating();
            this.feedbackComment = assignment.getComplaint().getFeedbackComment();
        }
        if (assignment.getVendor() != null) {
            this.vendorId = assignment.getVendor().getUserId();
            this.vendorName = assignment.getVendor().getFullName() != null ? assignment.getVendor().getFullName() : assignment.getVendor().getUsername();
            this.vendorUsername = assignment.getVendor().getUsername();
            this.vendorPhone = assignment.getVendor().getPhone();
        }
        if (assignment.getAssignedBy() != null) {
            this.assignedByName = assignment.getAssignedBy().getFullName() != null ? assignment.getAssignedBy().getFullName() : assignment.getAssignedBy().getUsername();
        }
        this.status = assignment.getStatus() != null ? assignment.getStatus().name() : "ASSIGNED";
        this.notes = assignment.getNotes();
        this.assignedAt = assignment.getAssignedAt();
        this.acceptedAt = assignment.getAcceptedAt();
        this.rejectedAt = assignment.getRejectedAt();
        this.rejectionReason = assignment.getRejectionReason();
        this.completedAt = assignment.getCompletedAt();

        this.startEvidenceImageData = assignment.getStartEvidenceImageData();
        this.completionEvidenceImageData = assignment.getCompletionEvidenceImageData();
        this.latitude = assignment.getLatitude();
        this.longitude = assignment.getLongitude();
        this.aiVerificationScore = assignment.getAiVerificationScore();
        this.aiVerificationNote = assignment.getAiVerificationNote();

        if (assignment.getContract() != null) {
            this.contractId = assignment.getContract().getContractId();
            this.contractNumber = assignment.getContract().getContractNumber();
        }
        this.department = assignment.getDepartment();
        this.departmentRequirements = assignment.getDepartmentRequirements();
        this.workInstructions = assignment.getWorkInstructions();
        this.estimatedHours = assignment.getEstimatedHours();
        this.slaDeadline = assignment.getSlaDeadline();

        this.verifiedAt = assignment.getVerifiedAt();
        this.verificationStatus = assignment.getVerificationStatus();
        this.verificationRemarks = assignment.getVerificationRemarks();
    }

    // Getters
    public Long getAssignmentId() { return assignmentId; }
    public String getWorkOrderNumber() { return workOrderNumber; }
    public Long getComplaintId() { return complaintId; }
    public String getComplaintRef() { return complaintRef; }
    public String getComplaintTitle() { return complaintTitle; }
    public String getComplaintDescription() { return complaintDescription; }
    public String getCategoryName() { return categoryName; }
    public String getLocation() { return location; }
    public String getPriority() { return priority; }
    public Integer getSeverityScore() { return severityScore; }
    public String getEvidenceImageData() { return evidenceImageData; }
    public String getEvidenceFileName() { return evidenceFileName; }
    public String getEvidenceContentType() { return evidenceContentType; }
    public Long getVendorId() { return vendorId; }
    public String getVendorName() { return vendorName; }
    public String getVendorUsername() { return vendorUsername; }
    public String getVendorPhone() { return vendorPhone; }
    public String getAssignedByName() { return assignedByName; }
    public String getStatus() { return status; }
    public String getNotes() { return notes; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
    public LocalDateTime getAcceptedAt() { return acceptedAt; }
    public LocalDateTime getRejectedAt() { return rejectedAt; }
    public String getRejectionReason() { return rejectionReason; }
    public LocalDateTime getCompletedAt() { return completedAt; }

    public String getStartEvidenceImageData() { return startEvidenceImageData; }
    public String getCompletionEvidenceImageData() { return completionEvidenceImageData; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public Integer getAiVerificationScore() { return aiVerificationScore; }
    public String getAiVerificationNote() { return aiVerificationNote; }

    public Long getContractId() { return contractId; }
    public String getContractNumber() { return contractNumber; }
    public String getDepartment() { return department; }
    public String getDepartmentRequirements() { return departmentRequirements; }
    public String getWorkInstructions() { return workInstructions; }
    public Integer getEstimatedHours() { return estimatedHours; }
    public LocalDateTime getSlaDeadline() { return slaDeadline; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public String getVerificationStatus() { return verificationStatus; }
    public String getVerificationRemarks() { return verificationRemarks; }

    public Integer getFeedbackRating() { return feedbackRating; }
    public String getFeedbackComment() { return feedbackComment; }
}
