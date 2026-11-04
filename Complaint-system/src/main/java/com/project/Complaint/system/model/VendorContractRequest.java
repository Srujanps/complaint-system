package com.project.Complaint.system.model;

import java.time.LocalDate;

public class VendorContractRequest {

    private String contractNumber;
    private Long vendorId;
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

    public VendorContractRequest() {}

    public String getContractNumber() { return contractNumber; }
    public void setContractNumber(String contractNumber) { this.contractNumber = contractNumber; }

    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }

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
}

