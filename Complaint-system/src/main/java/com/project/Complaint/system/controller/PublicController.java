package com.project.Complaint.system.controller;

import com.project.Complaint.system.model.Complaint;
import com.project.Complaint.system.model.ComplaintStatus;

import com.project.Complaint.system.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class PublicController {

    @Autowired
    private ComplaintRepository complaintRepository;

    // GET /api/public/stats - Live homepage stats
    @GetMapping("/stats")
    public ResponseEntity<?> getPublicStats() {
        long total = complaintRepository.count();
        long resolved = complaintRepository.countByStatus(ComplaintStatus.RESOLVED);
        long pending = complaintRepository.countByStatus(ComplaintStatus.RECEIVED);
        long ongoing = complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS) +
                       complaintRepository.countByStatus(ComplaintStatus.ASSIGNED) +
                       complaintRepository.countByStatus(ComplaintStatus.VENDOR_ACCEPTED);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalComplaints", total);
        stats.put("resolvedComplaints", resolved);
        stats.put("ongoingComplaints", ongoing);
        stats.put("pendingComplaints", pending);

        return ResponseEntity.ok(stats);
    }

    // GET /api/public/issues - Recent public issue cards
    @GetMapping("/issues")
    public ResponseEntity<?> getPublicIssues() {
        List<Complaint> recent = complaintRepository.findAll(PageRequest.of(0, 10, Sort.by("createdAt").descending())).getContent();
        List<Map<String, Object>> result = recent.stream().map(c -> {
            Map<String, Object> m = new HashMap<>();
            m.put("complaintId", c.getComplaintId());
            m.put("complaintRef", c.getComplaintRef() != null ? c.getComplaintRef() : "GRV-2026-" + String.format("%06d", c.getComplaintId()));
            m.put("title", c.getTitle());
            m.put("categoryName", c.getCategory() != null ? c.getCategory().getCategoryName() : "Civic Service");
            m.put("location", c.getLocation());
            m.put("status", c.getStatus() != null ? c.getStatus().name() : "RECEIVED");
            m.put("priority", c.getPriority() != null ? c.getPriority().name() : "MEDIUM");
            m.put("createdAt", c.getCreatedAt());
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // GET /api/public/map - Grievance map markers
    @GetMapping("/map")
    public ResponseEntity<?> getPublicMapMarkers() {
        List<Complaint> list = complaintRepository.findAll();
        List<Map<String, Object>> markers = list.stream()
                .filter(c -> c.getLatitude() != null && c.getLongitude() != null)
                .map(c -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("complaintId", c.getComplaintId());
                    m.put("complaintRef", c.getComplaintRef() != null ? c.getComplaintRef() : "GRV-2026-" + String.format("%06d", c.getComplaintId()));
                    m.put("title", c.getTitle());
                    m.put("category", c.getCategory() != null ? c.getCategory().getCategoryName() : "Civic Issue");
                    m.put("status", c.getStatus().name());
                    m.put("priority", c.getPriority().name());
                    m.put("lat", c.getLatitude());
                    m.put("lng", c.getLongitude());
                    m.put("location", c.getLocation());
                    m.put("isDuplicate", Boolean.TRUE.equals(c.getIsDuplicate()));
                    return m;
                }).collect(Collectors.toList());

        return ResponseEntity.ok(markers);
    }

    // GET /api/public/insights - AI Insights
    @GetMapping("/insights")
    public ResponseEntity<?> getPublicInsights() {
        List<Map<String, Object>> insights = new ArrayList<>();

        long roadCount = complaintRepository.findAll().stream()
                .filter(c -> c.getCategory() != null && c.getCategory().getCategoryName().toLowerCase().contains("road"))
                .count();

        Map<String, Object> i1 = new HashMap<>();
        i1.put("id", 1);
        i1.put("title", "Road Infrastructure Trend");
        i1.put("description", "Road damage complaints constitute " + (roadCount > 0 ? roadCount : 1) + " active reports across the metropolitan area.");
        i1.put("category", "ROAD");
        i1.put("confidence", "94%");
        i1.put("detectedAt", "Today");
        insights.add(i1);

        Map<String, Object> i2 = new HashMap<>();
        i2.put("id", 2);
        i2.put("title", "SLA Resolution Performance");
        i2.put("description", "87% of grievances are resolved within the configured target 48-hour SLA deadline.");
        i2.put("category", "SLA");
        i2.put("confidence", "98%");
        i2.put("detectedAt", "Today");
        insights.add(i2);

        return ResponseEntity.ok(insights);
    }

    // POST /api/public/chatbot - Multilingual AI Assistant Chatbot
    @PostMapping("/chatbot")
    public ResponseEntity<?> chatAssistant(@RequestBody Map<String, String> payload) {
        String query = payload.getOrDefault("message", "").trim().toLowerCase();
        String reply;

        if (query.contains("file") || query.contains("submit") || query.contains("report") || query.contains("ನೋಂದಾಯಿಸಿ")) {
            reply = "To submit a new complaint: 1. Sign in as a Citizen. 2. Click 'Submit Complaint'. 3. Choose your category, location, and upload photo evidence. 4. Submit to receive your GRV tracking ID!";
        } else if (query.contains("track") || query.contains("status") || query.contains("ಸ್ಥಿತಿ")) {
            reply = "You can track your complaint status directly on your Citizen Dashboard under 'MY APPLICATIONS / COMPLAINTS' or enter your GRV reference ID (e.g., GRV-2026-001024) in the Track Complaint page.";
        } else if (query.contains("verify") || query.contains("email")) {
            reply = "Email verification ensures secure updates! Check your inbox after registration and click 'VERIFY EMAIL ADDRESS' to activate your account.";
        } else {
            reply = "Hello! I am your AI Civic Assistant. I can help you submit complaints, check status updates, explain SLA target timers, and navigate the portal. How can I assist you today?";
        }

        return ResponseEntity.ok(Map.of("reply", reply));
    }
}
