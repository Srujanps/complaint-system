package com.project.Complaint.system.controller;

import com.project.Complaint.system.model.ContractStatus;
import com.project.Complaint.system.model.User;
import com.project.Complaint.system.model.VendorContractRequest;
import com.project.Complaint.system.model.VendorContractResponse;
import com.project.Complaint.system.repository.UserRepository;
import com.project.Complaint.system.service.VendorContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class ContractController {

    @Autowired
    private VendorContractService contractService;

    @Autowired
    private UserRepository userRepository;

    // ── Admin Contract Management ─────────────────────────────────────────────
    @GetMapping("/api/admin/contracts")
    public ResponseEntity<?> getAllContractsAdmin() {
        try {
            List<VendorContractResponse> contracts = contractService.getAllContracts();
            return ResponseEntity.ok(contracts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching contracts: " + e.getMessage());
        }
    }

    @PostMapping("/api/admin/contracts")
    public ResponseEntity<?> createContract(@RequestBody VendorContractRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User admin = userRepository.findByUsername(auth.getName()).orElse(null);
            VendorContractResponse created = contractService.createContract(request, admin);
            return ResponseEntity.status(201).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/api/admin/contracts/{id}")
    public ResponseEntity<?> updateContract(@PathVariable Long id, @RequestBody VendorContractRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User admin = userRepository.findByUsername(auth.getName()).orElse(null);
            VendorContractResponse updated = contractService.updateContract(id, request, admin);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/api/admin/contracts/{id}/status")
    public ResponseEntity<?> updateContractStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            String statusStr = payload.get("status");
            if (statusStr == null || statusStr.isBlank()) {
                return ResponseEntity.badRequest().body("Status is required (ACTIVE, EXPIRED, SUSPENDED, TERMINATED).");
            }
            ContractStatus status = ContractStatus.valueOf(statusStr.toUpperCase());
            VendorContractResponse updated = contractService.updateContractStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating contract status: " + e.getMessage());
        }
    }

    // ── Common Access for Officers & Vendors ───────────────────────────────────
    @GetMapping("/api/contracts")
    public ResponseEntity<?> getContracts(
            @RequestParam(required = false) Long vendorId,
            @RequestParam(required = false) String department) {
        try {
            if (vendorId != null) {
                return ResponseEntity.ok(contractService.getContractsByVendor(vendorId));
            }
            if (department != null && !department.isBlank()) {
                return ResponseEntity.ok(contractService.getContractsByDepartment(department));
            }
            return ResponseEntity.ok(contractService.getAllContracts());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/api/contracts/{id}")
    public ResponseEntity<?> getContractById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(contractService.getContractById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/api/vendor/contracts")
    public ResponseEntity<?> getVendorMyContracts() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User vendor = userRepository.findByUsername(auth.getName())
                    .orElseThrow(() -> new RuntimeException("Vendor not found"));
            return ResponseEntity.ok(contractService.getContractsByVendor(vendor.getUserId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

