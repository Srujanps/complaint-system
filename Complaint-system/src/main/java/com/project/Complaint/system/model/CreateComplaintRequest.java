package com.project.Complaint.system.model;

public class CreateComplaintRequest {

    private String title;
    private String description;
    private Long categoryId;
    private String location;
    private Double latitude;
    private Double longitude;
    private String evidenceImageData;
    private String evidenceFileName;
    private String evidenceContentType;

    // Constructors
    public CreateComplaintRequest() {}

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getEvidenceImageData() { return evidenceImageData; }
    public void setEvidenceImageData(String evidenceImageData) { this.evidenceImageData = evidenceImageData; }

    public String getEvidenceFileName() { return evidenceFileName; }
    public void setEvidenceFileName(String evidenceFileName) { this.evidenceFileName = evidenceFileName; }

    public String getEvidenceContentType() { return evidenceContentType; }
    public void setEvidenceContentType(String evidenceContentType) { this.evidenceContentType = evidenceContentType; }
}
