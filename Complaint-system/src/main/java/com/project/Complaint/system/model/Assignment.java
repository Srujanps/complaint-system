package com.project.Complaint.system.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "assignments")
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long assignmentId;

    @Column(length = 60, unique = true)
    private String workOrderNumber;

    @ManyToOne
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @ManyToOne
    @JoinColumn(name = "vendor_id", nullable = false)
    private User vendor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "contract_id")
    private VendorContract contract;

    @Column(length = 120)
    private String department;

    @Column(columnDefinition = "TEXT")
    private String departmentRequirements;

    @Column(columnDefinition = "TEXT")
    private String workInstructions;

    private Integer estimatedHours;

    private LocalDateTime slaDeadline;

    @ManyToOne
    @JoinColumn(name = "assigned_by", nullable = false)
    private User assignedBy;

    @CreationTimestamp
    private LocalDateTime assignedAt;

    private LocalDateTime acceptedAt;

    private LocalDateTime rejectedAt;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    private AssignmentStatus status = AssignmentStatus.ASSIGNED;

    private LocalDateTime completedAt;

    @Column(columnDefinition = "TEXT")
    private String startEvidenceImageData;

    @Column(columnDefinition = "TEXT")
    private String completionEvidenceImageData;

    private Double latitude;
    private Double longitude;
    private Integer aiVerificationScore;

    @Column(columnDefinition = "TEXT")
    private String aiVerificationNote;

    private LocalDateTime verifiedAt;

    @Column(length = 40)
    private String verificationStatus; // APPROVED, REJECTED_REWORK, PENDING

    @Column(columnDefinition = "TEXT")
    private String verificationRemarks;

    // Constructors
    public Assignment() {}

    public Assignment(Complaint complaint, User vendor, User assignedBy) {
        this.complaint = complaint;
        this.vendor = vendor;
        this.assignedBy = assignedBy;
    }

    // Getters and Setters
    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }

    public String getWorkOrderNumber() { return workOrderNumber; }
    public void setWorkOrderNumber(String workOrderNumber) { this.workOrderNumber = workOrderNumber; }

    public Complaint getComplaint() { return complaint; }
    public void setComplaint(Complaint complaint) { this.complaint = complaint; }

    public User getVendor() { return vendor; }
    public void setVendor(User vendor) { this.vendor = vendor; }

    public VendorContract getContract() { return contract; }
    public void setContract(VendorContract contract) { this.contract = contract; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getDepartmentRequirements() { return departmentRequirements; }
    public void setDepartmentRequirements(String departmentRequirements) { this.departmentRequirements = departmentRequirements; }

    public String getWorkInstructions() { return workInstructions; }
    public void setWorkInstructions(String workInstructions) { this.workInstructions = workInstructions; }

    public Integer getEstimatedHours() { return estimatedHours; }
    public void setEstimatedHours(Integer estimatedHours) { this.estimatedHours = estimatedHours; }

    public LocalDateTime getSlaDeadline() { return slaDeadline; }
    public void setSlaDeadline(LocalDateTime slaDeadline) { this.slaDeadline = slaDeadline; }

    public User getAssignedBy() { return assignedBy; }
    public void setAssignedBy(User assignedBy) { this.assignedBy = assignedBy; }

    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }

    public LocalDateTime getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(LocalDateTime acceptedAt) { this.acceptedAt = acceptedAt; }

    public LocalDateTime getRejectedAt() { return rejectedAt; }
    public void setRejectedAt(LocalDateTime rejectedAt) { this.rejectedAt = rejectedAt; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public AssignmentStatus getStatus() { return status; }
    public void setStatus(AssignmentStatus status) { this.status = status; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public String getStartEvidenceImageData() { return startEvidenceImageData; }
    public void setStartEvidenceImageData(String startEvidenceImageData) { this.startEvidenceImageData = startEvidenceImageData; }

    public String getCompletionEvidenceImageData() { return completionEvidenceImageData; }
    public void setCompletionEvidenceImageData(String completionEvidenceImageData) { this.completionEvidenceImageData = completionEvidenceImageData; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Integer getAiVerificationScore() { return aiVerificationScore; }
    public void setAiVerificationScore(Integer aiVerificationScore) { this.aiVerificationScore = aiVerificationScore; }

    public String getAiVerificationNote() { return aiVerificationNote; }
    public void setAiVerificationNote(String aiVerificationNote) { this.aiVerificationNote = aiVerificationNote; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public String getVerificationRemarks() { return verificationRemarks; }
    public void setVerificationRemarks(String verificationRemarks) { this.verificationRemarks = verificationRemarks; }
}
