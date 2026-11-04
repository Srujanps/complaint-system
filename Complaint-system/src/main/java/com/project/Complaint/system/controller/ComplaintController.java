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

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private UserRepository userRepository;

    // Create complaint (CITIZEN only)
    @PostMapping("/create")
    public ResponseEntity<?> createComplaint(@RequestBody CreateComplaintRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            User citizen = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            ComplaintResponse response = complaintService.createComplaint(request, citizen);
            return ResponseEntity.status(201).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get own complaints (CITIZEN)
    @GetMapping("/my")
    public ResponseEntity<?> getMyComplaints() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            User citizen = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<ComplaintResponse> complaints = complaintService.getComplaintsByCitizen(citizen);
            return ResponseEntity.ok(complaints);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get complaint by ID (Any authenticated user)
    @GetMapping("/{id}")
    public ResponseEntity<?> getComplaintById(@PathVariable Long id) {
        try {
            ComplaintResponse response = complaintService.getComplaintById(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get complaint by Ref (Any authenticated user)
    @GetMapping("/ref/{ref}")
    public ResponseEntity<?> getComplaintByRef(@PathVariable String ref) {
        try {
            ComplaintResponse response = complaintService.getComplaintByRef(ref);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Reopen complaint (CITIZEN)
    @PostMapping("/{id}/reopen")
    public ResponseEntity<?> reopenComplaint(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User citizen = userRepository.findByUsername(auth.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String reason = body.getOrDefault("reason", "Issue persists after marked resolution.");
            String evidenceData = body.get("evidenceImageData");

            ComplaintResponse response = complaintService.reopenComplaint(id, reason, evidenceData, citizen);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Record citizen feedback (CITIZEN)
    @PostMapping("/{id}/feedback")
    public ResponseEntity<?> recordFeedback(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User citizen = userRepository.findByUsername(auth.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String feedback = (String) body.getOrDefault("feedback", "SOLVED");
            Integer rating = body.get("rating") != null ? Integer.parseInt(body.get("rating").toString()) : 5;
            String comment = (String) body.get("comment");

            ComplaintResponse response = complaintService.recordFeedback(id, feedback, rating, comment, citizen);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Confirm or override AI category (OFFICER)
    @PutMapping("/{id}/confirm-ai-category")
    public ResponseEntity<?> confirmAiCategory(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        try {
            String overrideCategory = (body != null) ? body.get("category") : null;
            ComplaintResponse response = complaintService.confirmAiCategory(id, overrideCategory);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get all flagged duplicate complaints (OFFICER)
    @GetMapping("/duplicates")
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