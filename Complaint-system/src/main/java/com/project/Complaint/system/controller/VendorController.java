package com.project.Complaint.system.controller;

import com.project.Complaint.system.model.*;
import com.project.Complaint.system.repository.UserRepository;
import com.project.Complaint.system.service.AssignmentService;
import com.project.Complaint.system.service.VendorContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendor")
@CrossOrigin(origins = "*")
public class VendorController {

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VendorContractService vendorContractService;

    // Get my assignments
    @GetMapping("/assignments")
    public ResponseEntity<?> getMyAssignments() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            User vendor = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<AssignmentResponse> assignments = assignmentService.getVendorAssignments(vendor);
            return ResponseEntity.ok(assignments);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get assignments by status
    @GetMapping("/assignments/status/{status}")
    public ResponseEntity<?> getAssignmentsByStatus(@PathVariable String status) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            User vendor = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            AssignmentStatus assignmentStatus = AssignmentStatus.valueOf(status.toUpperCase());
            List<AssignmentResponse> assignments = assignmentService.getVendorAssignmentsByStatus(vendor, assignmentStatus);

            return ResponseEntity.ok(assignments);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Update assignment status
    @PutMapping("/assignments/{id}/status")
    public ResponseEntity<?> updateAssignmentStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            User vendor = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            AssignmentResponse response = assignmentService.updateAssignmentStatus(id, request, vendor);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Vendor accepts work order
    @PutMapping("/assignments/{id}/accept")
    public ResponseEntity<?> acceptAssignment(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User vendor = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            AssignmentResponse response = assignmentService.vendorAcceptAssignment(id, vendor);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Vendor rejects work order
    @PutMapping("/assignments/{id}/reject")
    public ResponseEntity<?> rejectAssignment(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, String> payload) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User vendor = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String reason = payload != null ? payload.get("reason") : "Vendor declined work order";
            AssignmentResponse response = assignmentService.vendorRejectAssignment(id, reason, vendor);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get single assignment details
    @GetMapping("/assignments/{id}")
    public ResponseEntity<?> getAssignmentById(@PathVariable Long id) {
        try {
            AssignmentResponse assignment = assignmentService.getAssignmentById(id);
            return ResponseEntity.ok(assignment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
