package com.project.Complaint.system.service;

import com.project.Complaint.system.model.*;
import com.project.Complaint.system.repository.UserRepository;
import com.project.Complaint.system.repository.VendorContractRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VendorContractService {

    @Autowired
    private VendorContractRepository contractRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public VendorContractResponse createContract(VendorContractRequest request, User admin) {
        if (request.getVendorId() == null) {
            throw new IllegalArgumentException("Vendor ID is required.");
        }
        User vendor = userRepository.findById(request.getVendorId())
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found with ID: " + request.getVendorId()));

        if (vendor.getRole() != Role.VENDOR) {
            throw new IllegalArgumentException("User must have VENDOR role to be awarded a contract.");
        }

        String contractNumber = request.getContractNumber();
        if (contractNumber == null || contractNumber.isBlank()) {
            String deptPrefix = getDepartmentCode(request.getDepartment());
            contractNumber = "CNT-2026-" + deptPrefix + "-" + String.format("%04d", (contractRepository.count() + 1));
        } else if (contractRepository.existsByContractNumber(contractNumber.trim())) {
            throw new IllegalArgumentException("Contract number already exists: " + contractNumber);
        }

        if (request.getStartDate() == null || request.getExpiryDate() == null) {
            throw new IllegalArgumentException("Start date and expiry date are required.");
        }
        if (request.getExpiryDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("Contract expiry date cannot be earlier than start date.");
        }

        ContractStatus status = ContractStatus.ACTIVE;
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            try {
                status = ContractStatus.valueOf(request.getStatus().toUpperCase());
            } catch (Exception ignored) {}
        }

        VendorContract contract = new VendorContract();
        contract.setContractNumber(contractNumber.trim());
        contract.setVendor(vendor);
        contract.setDepartment(request.getDepartment() != null ? request.getDepartment().trim() : "Road Maintenance");
        contract.setContractTitle(request.getContractTitle() != null ? request.getContractTitle().trim() : "Municipal Service Contract");
        contract.setContractValue(request.getContractValue() != null ? request.getContractValue() : 0.0);
        contract.setStartDate(request.getStartDate());
        contract.setExpiryDate(request.getExpiryDate());
        contract.setStatus(status);
        contract.setCoveredWards(request.getCoveredWards() != null ? request.getCoveredWards().trim() : "All Wards");
        contract.setApprovedCategories(request.getApprovedCategories() != null ? request.getApprovedCategories().trim() : "General");
        contract.setContractSlaHours(request.getContractSlaHours() != null && request.getContractSlaHours() > 0 ? request.getContractSlaHours() : 24);
        contract.setContractualRates(request.getContractualRates());
        contract.setWorkConditions(request.getWorkConditions());
        contract.setDocumentName(request.getDocumentName());
        contract.setDocumentData(request.getDocumentData());

        VendorContract saved = contractRepository.save(contract);
        return new VendorContractResponse(saved);
    }

    @Transactional
    public VendorContractResponse updateContract(Long contractId, VendorContractRequest request, User admin) {
        VendorContract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new IllegalArgumentException("Contract not found with ID: " + contractId));

        if (request.getVendorId() != null && !request.getVendorId().equals(contract.getVendor().getUserId())) {
            User vendor = userRepository.findById(request.getVendorId())
                    .orElseThrow(() -> new IllegalArgumentException("Vendor not found with ID: " + request.getVendorId()));
            if (vendor.getRole() != Role.VENDOR) {
                throw new IllegalArgumentException("Selected user must have VENDOR role.");
            }
            contract.setVendor(vendor);
        }

        if (request.getDepartment() != null && !request.getDepartment().isBlank()) {
            contract.setDepartment(request.getDepartment().trim());
        }
        if (request.getContractTitle() != null && !request.getContractTitle().isBlank()) {
            contract.setContractTitle(request.getContractTitle().trim());
        }
        if (request.getContractValue() != null) {
            contract.setContractValue(request.getContractValue());
        }
        if (request.getStartDate() != null) {
            contract.setStartDate(request.getStartDate());
        }
        if (request.getExpiryDate() != null) {
            if (contract.getStartDate() != null && request.getExpiryDate().isBefore(contract.getStartDate())) {
                throw new IllegalArgumentException("Expiry date cannot precede start date.");
            }
            contract.setExpiryDate(request.getExpiryDate());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            try {
                contract.setStatus(ContractStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (Exception ignored) {}
        }
        if (request.getCoveredWards() != null) {
            contract.setCoveredWards(request.getCoveredWards().trim());
        }
        if (request.getApprovedCategories() != null) {
            contract.setApprovedCategories(request.getApprovedCategories().trim());
        }
        if (request.getContractSlaHours() != null && request.getContractSlaHours() > 0) {
            contract.setContractSlaHours(request.getContractSlaHours());
        }
        if (request.getContractualRates() != null) {
            contract.setContractualRates(request.getContractualRates());
        }
        if (request.getWorkConditions() != null) {
            contract.setWorkConditions(request.getWorkConditions());
        }
        if (request.getDocumentData() != null && !request.getDocumentData().isBlank()) {
            contract.setDocumentData(request.getDocumentData());
            contract.setDocumentName(request.getDocumentName());
        }

        VendorContract updated = contractRepository.save(contract);
        return new VendorContractResponse(updated);
    }

    @Transactional
    public VendorContractResponse updateContractStatus(Long contractId, ContractStatus status) {
        VendorContract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new IllegalArgumentException("Contract not found with ID: " + contractId));
        contract.setStatus(status);
        VendorContract updated = contractRepository.save(contract);
        return new VendorContractResponse(updated);
    }

    public List<VendorContractResponse> getAllContracts() {
        return contractRepository.findAll().stream()
                .map(VendorContractResponse::new)
                .collect(Collectors.toList());
    }

    public List<VendorContractResponse> getContractsByVendor(Long vendorId) {
        return contractRepository.findByVendor_UserId(vendorId).stream()
                .map(VendorContractResponse::new)
                .collect(Collectors.toList());
    }

    public List<VendorContractResponse> getContractsByDepartment(String department) {
        return contractRepository.findByDepartment(department).stream()
                .map(VendorContractResponse::new)
                .collect(Collectors.toList());
    }

    public VendorContractResponse getContractById(Long contractId) {
        VendorContract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new IllegalArgumentException("Contract not found with ID: " + contractId));
        return new VendorContractResponse(contract);
    }

    public VendorContract findActiveContract(User vendor, String department) {
        List<VendorContract> contracts = contractRepository.findByVendor(vendor);
        LocalDate now = LocalDate.now();
        return contracts.stream()
                .filter(c -> c.getStatus() == ContractStatus.ACTIVE)
                .filter(c -> c.getExpiryDate() == null || !c.getExpiryDate().isBefore(now))
                .filter(c -> department == null || department.equalsIgnoreCase(c.getDepartment()) || c.getDepartment().toLowerCase().contains(department.toLowerCase()))
                .findFirst()
                .orElse(null);
    }

    private String getDepartmentCode(String dept) {
        if (dept == null) return "GEN";
        String lower = dept.toLowerCase();
        if (lower.contains("road")) return "RD";
        if (lower.contains("water") || lower.contains("drain")) return "WS";
        if (lower.contains("electr") || lower.contains("light")) return "EM";
        if (lower.contains("sanit") || lower.contains("garb") || lower.contains("waste")) return "SW";
        return "GEN";
    }
}

