package com.project.Complaint.system.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vendor_contracts")
public class VendorContract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long contractId;

    @Column(nullable = false, unique = true, length = 100)
    private String contractNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vendor_id", nullable = false)
    private User vendor;

    @Column(nullable = false, length = 120)
    private String department;

    @Column(nullable = false, length = 200)
    private String contractTitle;

    private Double contractValue;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ContractStatus status = ContractStatus.ACTIVE;

    @Column(columnDefinition = "TEXT")
    private String coveredWards;

    @Column(columnDefinition = "TEXT")
    private String approvedCategories;

    private Integer contractSlaHours = 48;

    @Column(columnDefinition = "TEXT")
    private String contractualRates;

    @Column(columnDefinition = "TEXT")
    private String workConditions;

    private String documentName;

    @Column(columnDefinition = "TEXT")
    private String documentData;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public VendorContract() {}

    public VendorContract(String contractNumber, User vendor, String department, String contractTitle, Double contractValue, LocalDate startDate, LocalDate expiryDate, ContractStatus status, String coveredWards, String approvedCategories, Integer contractSlaHours, String contractualRates, String workConditions) {
        this.contractNumber = contractNumber;
        this.vendor = vendor;
        this.department = department;
        this.contractTitle = contractTitle;
        this.contractValue = contractValue;
        this.startDate = startDate;
        this.expiryDate = expiryDate;
        this.status = status;
        this.coveredWards = coveredWards;
        this.approvedCategories = approvedCategories;
        this.contractSlaHours = contractSlaHours;
        this.contractualRates = contractualRates;
        this.workConditions = workConditions;
    }

    public Long getContractId() { return contractId; }
    public void setContractId(Long contractId) { this.contractId = contractId; }

    public String getContractNumber() { return contractNumber; }
    public void setContractNumber(String contractNumber) { this.contractNumber = contractNumber; }

    public User getVendor() { return vendor; }
    public void setVendor(User vendor) { this.vendor = vendor; }

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

    public ContractStatus getStatus() { return status; }
    public void setStatus(ContractStatus status) { this.status = status; }

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
}

