package com.project.Complaint.system.controller;

import com.project.Complaint.system.model.*;
import com.project.Complaint.system.repository.ComplaintRepository;
import com.project.Complaint.system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/representative")
@CrossOrigin(origins = "*")
public class RepresentativeController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentRep() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String getConstituency(User rep) {
        String area = rep.getConstituency();
        if (area == null || area.isBlank()) {
            throw new RuntimeException("No constituency configured for this representative");
        }
        return area;
    }

    @GetMapping("/complaints")
    public ResponseEntity<?> getAreaComplaints(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        try {
            User rep = getCurrentRep();
            String area = getConstituency(rep);
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<ComplaintResponse> complaints = complaintRepository
                    .findByLocationContainingIgnoreCase(area, pageable)
                    .map(ComplaintResponse::new);
            return ResponseEntity.ok(complaints);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/complaints/stats")
    public ResponseEntity<?> getAreaStats() {
        try {
            User rep = getCurrentRep();
            String area = getConstituency(rep);

            Map<String, Object> stats = new HashMap<>();
            stats.put("area", area);
            stats.put("designation", rep.getDesignation());

            long total = complaintRepository.countByLocationContainingIgnoreCase(area);
            stats.put("total", total);

            Map<String, Long> byStatus = new HashMap<>();
            for (ComplaintStatus status : ComplaintStatus.values()) {
                byStatus.put(status.name(),
                        complaintRepository.countByLocationContainingIgnoreCaseAndStatus(area, status));
            }
            stats.put("byStatus", byStatus);

            stats.put("resolved", byStatus.getOrDefault("RESOLVED", 0L) + byStatus.getOrDefault("CLOSED", 0L));
            stats.put("escalated", byStatus.getOrDefault("ESCALATED", 0L));
            stats.put("pending",
                    byStatus.getOrDefault("CREATED", 0L)
                            + byStatus.getOrDefault("VERIFIED", 0L)
                            + byStatus.getOrDefault("ASSIGNED", 0L)
                            + byStatus.getOrDefault("IN_PROGRESS", 0L));

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/complaints/{id}/escalate")
    public ResponseEntity<?> escalateComplaint(@PathVariable Long id) {
        try {
            Complaint complaint = complaintRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Complaint not found"));

            complaint.setStatus(ComplaintStatus.ESCALATED);
            complaintRepository.save(complaint);

            return ResponseEntity.ok(Map.of(
                    "message", "Complaint escalated successfully",
                    "complaintId", id,
                    "newStatus", "ESCALATED"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/complaints/{id}/endorse")
    public ResponseEntity<?> endorseComplaint(@PathVariable Long id) {
        try {
            Complaint complaint = complaintRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Complaint not found"));

            if (complaint.getStatus() != ComplaintStatus.RESOLVED) {
                return ResponseEntity.badRequest()
                        .body("Only RESOLVED complaints can be endorsed. Current status: " + complaint.getStatus());
            }

            complaint.setStatus(ComplaintStatus.CLOSED);
            complaintRepository.save(complaint);

            return ResponseEntity.ok(Map.of(
                    "message", "Complaint endorsed and closed successfully",
                    "complaintId", id,
                    "newStatus", "CLOSED"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/complaints/{id}/priority")
    public ResponseEntity<?> setPriority(
            @PathVariable Long id,
            @RequestParam String priority) {
        try {
            Complaint complaint = complaintRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Complaint not found"));

            Priority newPriority = Priority.valueOf(priority.toUpperCase());
            complaint.setPriority(newPriority);
            complaintRepository.save(complaint);

            return ResponseEntity.ok(Map.of(
                    "message", "Priority updated successfully",
                    "complaintId", id,
                    "newPriority", newPriority.name()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid priority. Use: LOW, MEDIUM, HIGH, CRITICAL");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Extra feature: Representative can attach an official remark/note to the complaint.
    @PutMapping("/complaints/{id}/remark")
    public ResponseEntity<?> setRemark(@PathVariable Long id, @RequestBody RepresentativeRemarkRequest request) {
        try {
            if (request.getRemark() == null || request.getRemark().isBlank()) {
                return ResponseEntity.badRequest().body("Remark cannot be empty");
            }

            Complaint complaint = complaintRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Complaint not found"));

            String note = request.getRemark().trim();
            if (note.length() > 1000) {
                return ResponseEntity.badRequest().body("Remark too long (max 1000 chars)");
            }

            // Store in description tail to avoid schema change (keeps DB compatible with existing deployments).
            // Format: "\n\n[REP NOTE] ...".
            String desc = complaint.getDescription() == null ? "" : complaint.getDescription();
            String marker = "\n\n[REP NOTE] ";
            // Remove previous rep note if present (last one wins)
            int idx = desc.lastIndexOf(marker);
            if (idx >= 0) {
                desc = desc.substring(0, idx);
            }
            complaint.setDescription((desc + marker + note).trim());

            // Small automatic boost: ensure minimum HIGH priority when a representative adds a note.
            if (complaint.getPriority() == null || complaint.getPriority() == Priority.LOW || complaint.getPriority() == Priority.MEDIUM) {
                complaint.setPriority(Priority.HIGH);
            }

            complaintRepository.save(complaint);

            return ResponseEntity.ok(Map.of(
                    "message", "Remark saved",
                    "complaintId", id
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
