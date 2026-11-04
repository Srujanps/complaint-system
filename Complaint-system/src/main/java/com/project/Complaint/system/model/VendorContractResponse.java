package com.project.Complaint.system.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class VendorContractResponse {

    private Long contractId;
    private String contractNumber;
    private Long vendorId;
    private String vendorName;
    private String vendorUsername;
    private String vendorPhone;
    private String vendorEmail;
    private String department;
    private String contractTitle;
    private Double contractValue;
    private LocalDate startDate;
    private LocalDate expiryDate;
    private String status;
    private String coveredWards;
    private String approvedCategories;
    private Integer contractSlaHours;
    private String contractualRates;
    private String workConditions;
    private String documentName;
    private String documentData;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean active;

    public VendorContractResponse() {}

    public VendorContractResponse(VendorContract contract) {
        this.contractId = contract.getContractId();
        this.contractNumber = contract.getContractNumber();
        if (contract.getVendor() != null) {
            this.vendorId = contract.getVendor().getUserId();
            this.vendorName = contract.getVendor().getFullName() != null ? contract.getVendor().getFullName() : contract.getVendor().getUsername();
            this.vendorUsername = contract.getVendor().getUsername();
            this.vendorPhone = contract.getVendor().getPhone();
            this.vendorEmail = contract.getVendor().getEmail();
        }
        this.department = contract.getDepartment();
        this.contractTitle = contract.getContractTitle();
        this.contractValue = contract.getContractValue();
        this.startDate = contract.getStartDate();
        this.expiryDate = contract.getExpiryDate();
        this.status = contract.getStatus() != null ? contract.getStatus().name() : "ACTIVE";
        this.coveredWards = contract.getCoveredWards();
        this.approvedCategories = contract.getApprovedCategories();
        this.contractSlaHours = contract.getContractSlaHours();
        this.contractualRates = contract.getContractualRates();
        this.workConditions = contract.getWorkConditions();
        this.documentName = contract.getDocumentName();
        this.documentData = contract.getDocumentData();
        this.createdAt = contract.getCreatedAt();
        this.updatedAt = contract.getUpdatedAt();

        boolean dateValid = (contract.getExpiryDate() == null || !contract.getExpiryDate().isBefore(LocalDate.now()));
        this.active = (contract.getStatus() == ContractStatus.ACTIVE && dateValid);
    }

    public Long getContractId() { return contractId; }
    public void setContractId(Long contractId) { this.contractId = contractId; }

    public String getContractNumber() { return contractNumber; }
    public void setContractNumber(String contractNumber) { this.contractNumber = contractNumber; }

    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }

    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }

    public String getVendorUsername() { return vendorUsername; }
    public void setVendorUsername(String vendorUsername) { this.vendorUsername = vendorUsername; }

    public String getVendorPhone() { return vendorPhone; }
    public void setVendorPhone(String vendorPhone) { this.vendorPhone = vendorPhone; }

    public String getVendorEmail() { return vendorEmail; }
    public void setVendorEmail(String vendorEmail) { this.vendorEmail = vendorEmail; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getContractTitle() { return contractTitle; }
    public void setContractTitle(String contractTitle) { this.contractTitle = contractTitle; }

    public Double getContractValue() { return contractValue; }
    public void setContractValue(Double contractValue) { this.contractValue = contractValue; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCoveredWards() { return coveredWards; }
    public void setCoveredWards(String coveredWards) { this.coveredWards = coveredWards; }

    public String getApprovedCategories() { return approvedCategories; }
    public void setApprovedCategories(String approvedCategories) { this.approvedCategories = approvedCategories; }

    public Integer getContractSlaHours() { return contractSlaHours; }
    public void setContractSlaHours(Integer contractSlaHours) { this.contractSlaHours = contractSlaHours; }

    public String getContractualRates() { return contractualRates; }
    public void setContractualRates(String contractualRates) { this.contractualRates = contractualRates; }

    public String getWorkConditions() { return workConditions; }
    public void setWorkConditions(String workConditions) { this.workConditions = workConditions; }

    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }

    public String getDocumentData() { return documentData; }
    public void setDocumentData(String documentData) { this.documentData = documentData; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}

