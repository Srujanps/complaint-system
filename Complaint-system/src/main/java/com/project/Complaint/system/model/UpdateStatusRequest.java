package com.project.Complaint.system.model;

public class UpdateStatusRequest {

    private String status;
    private String notes;
    private String rejectionReason;
    private String evidenceImageData;
    private String evidenceFileName;
    private Double latitude;
    private Double longitude;
    private Integer aiVerificationScore;
    private String aiVerificationNote;
    private String verificationStatus;
    private String verificationRemarks;

    // Constructors
    public UpdateStatusRequest() {}

    // Getters and Setters
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getEvidenceImageData() { return evidenceImageData; }
    public void setEvidenceImageData(String evidenceImageData) { this.evidenceImageData = evidenceImageData; }

    public String getEvidenceFileName() { return evidenceFileName; }
    public void setEvidenceFileName(String evidenceFileName) { this.evidenceFileName = evidenceFileName; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Integer getAiVerificationScore() { return aiVerificationScore; }
    public void setAiVerificationScore(Integer aiVerificationScore) { this.aiVerificationScore = aiVerificationScore; }

    public String getAiVerificationNote() { return aiVerificationNote; }
    public void setAiVerificationNote(String aiVerificationNote) { this.aiVerificationNote = aiVerificationNote; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public String getVerificationRemarks() { return verificationRemarks; }
    public void setVerificationRemarks(String verificationRemarks) { this.verificationRemarks = verificationRemarks; }
}
