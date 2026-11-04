package com.project.Complaint.system.model;

public class AssignmentRequest {

    private Long complaintId;
    private Long vendorId;
    private Long contractId;
    private String department;
    private String notes;
    private String workInstructions;
    private String departmentRequirements;
    private Integer estimatedHours;
    private Boolean overrideIneligible = false;
    private String overrideReason;

    // Constructors
    public AssignmentRequest() {}

    // Getters and Setters
    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }

    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }

    public Long getContractId() { return contractId; }
    public void setContractId(Long contractId) { this.contractId = contractId; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getWorkInstructions() { return workInstructions; }
    public void setWorkInstructions(String workInstructions) { this.workInstructions = workInstructions; }

    public String getDepartmentRequirements() { return departmentRequirements; }
    public void setDepartmentRequirements(String departmentRequirements) { this.departmentRequirements = departmentRequirements; }

    public Integer getEstimatedHours() { return estimatedHours; }
    public void setEstimatedHours(Integer estimatedHours) { this.estimatedHours = estimatedHours; }

    public Boolean getOverrideIneligible() { return overrideIneligible; }
    public void setOverrideIneligible(Boolean overrideIneligible) { this.overrideIneligible = overrideIneligible; }

    public String getOverrideReason() { return overrideReason; }
    public void setOverrideReason(String overrideReason) { this.overrideReason = overrideReason; }
}
