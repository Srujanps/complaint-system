package com.project.Complaint.system.controller;

import com.project.Complaint.system.model.*;
import com.project.Complaint.system.repository.UserRepository;
import com.project.Complaint.system.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.project.Complaint.system.service.AICategorizationService;
import com.project.Complaint.system.service.AssignmentService;

import java.util.List;

@RestController
@RequestMapping("/api/officer")
@CrossOrigin(origins = "*")
public class OfficerController {

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AICategorizationService aiCategorizationService;

    // Get all complaints
    @GetMapping("/complaints")
    public ResponseEntity<?> getAllComplaints(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Page<ComplaintResponse> complaints = complaintService.getAllComplaints(page, size);
            return ResponseEntity.ok(complaints);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get complaints by status
    @GetMapping("/complaints/status/{status}")
    public ResponseEntity<?> getComplaintsByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            ComplaintStatus complaintStatus = ComplaintStatus.valueOf(status.toUpperCase());
            Page<ComplaintResponse> complaints = complaintService.getComplaintsByStatus(complaintStatus, page, size);
            return ResponseEntity.ok(complaints);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PostMapping("/complaints/assign")
    public ResponseEntity<?> assignComplaintToVendor(@RequestBody AssignmentRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            User officer = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            AssignmentResponse response = assignmentService.assignToVendor(request, officer);
            return ResponseEntity.status(201).body(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ADD this method
// Get all assignments
    @GetMapping("/assignments")
    public ResponseEntity<?> getAllAssignments() {
        try {
            List<AssignmentResponse> assignments = assignmentService.getAllAssignments();
            return ResponseEntity.ok(assignments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Update complaint status
    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<?> updateComplaintStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String note) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            var officer = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            ComplaintStatus newStatus = ComplaintStatus.valueOf(status.toUpperCase());
            ComplaintResponse response = complaintService.updateStatus(id, newStatus, note, officer);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Confirm or override AI category
    @PutMapping("/complaints/{id}/confirm-ai-category")
    public ResponseEntity<?> confirmAiCategory(@PathVariable Long id, @RequestBody(required = false) java.util.Map<String, String> body) {
        try {
            String overrideCategory = (body != null) ? body.get("category") : null;
            ComplaintResponse response = complaintService.confirmAiCategory(id, overrideCategory);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get vendor eligibility and AI matchmaker recommendations for complaint assignment
    @GetMapping("/complaints/{id}/vendor-eligibility")
    public ResponseEntity<?> getVendorEligibility(@PathVariable Long id) {
        try {
            java.util.Map<String, Object> result = aiCategorizationService.getVendorEligibility(id);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get assignment details for a complaint (work order, vendor progress, verification)
    @GetMapping("/complaints/{id}/assignment")
    public ResponseEntity<?> getComplaintAssignment(@PathVariable Long id) {
        try {
            AssignmentResponse assignment = assignmentService.getAssignmentByComplaintId(id);
            return ResponseEntity.ok(assignment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Officer department-specific completion verification
    @PostMapping("/assignments/{id}/verify")
    public ResponseEntity<?> verifyAssignmentCompletion(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> payload) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User officer = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Officer user not found"));

            String verificationStatus = payload.get("verificationStatus");
            String remarks = payload.get("remarks");

            AssignmentResponse response = assignmentService.verifyCompletion(id, verificationStatus, remarks, officer);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get all flagged duplicate complaints
    @GetMapping("/complaints/duplicates")
    public ResponseEntity<?> getDuplicates(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Page<ComplaintResponse> duplicates = complaintService.getComplaintsByStatus(ComplaintStatus.FLAGGED_DUPLICATE, page, size);
            return ResponseEntity.ok(duplicates);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}