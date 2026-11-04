package com.project.Complaint.system.controller;

import com.project.Complaint.system.model.Complaint;
import com.project.Complaint.system.model.User;
import com.project.Complaint.system.repository.ComplaintRepository;
import com.project.Complaint.system.repository.UserRepository;
import com.project.Complaint.system.service.AICategorizationService;
import com.project.Complaint.system.service.AICategorizationService.AIAnalysisResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIController {

    @Autowired
    private AICategorizationService aiCategorizationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    // ── 1. CITIZEN: Multimodal Vision & Text Intake Analysis ─────────────────
    @PostMapping("/analyze-complaint")
    public ResponseEntity<?> analyzeComplaint(@RequestBody Map<String, Object> payload) {
        try {
            String title = (String) payload.get("title");
            String description = (String) payload.get("description");
            String imageBase64 = (String) payload.get("evidenceImageData");
            if (imageBase64 == null) {
                imageBase64 = (String) payload.get("imageBase64");
            }

            String fileName = (String) payload.get("fileName");
            if (fileName == null) {
                fileName = (String) payload.get("evidenceFileName");
            }

            if ((title == null || title.isBlank()) && (description == null || description.isBlank()) && 
                (imageBase64 == null || imageBase64.isBlank()) && (fileName == null || fileName.isBlank())) {
                return ResponseEntity.badRequest().body("Title, Description, Evidence Photo, or File Name is required for AI analysis.");
            }

            AIAnalysisResult result = aiCategorizationService.analyzeComplaintWithVision(title, description, imageBase64, fileName);

            Map<String, Object> response = new HashMap<>();
            response.put("suggestedCategoryName", result.getSuggestedCategoryName());
            response.put("suggestedCategoryId", result.getSuggestedCategoryId());
            response.put("severityScore", result.getSeverityScore());
            response.put("priority", result.getPriority() != null ? result.getPriority().name() : "MEDIUM");
            response.put("slaTargetHours", result.getSlaTargetHours());
            response.put("reasoning", result.getReasoning());
            response.put("suggestedTitle", result.getSuggestedTitle());
            response.put("suggestedDescription", result.getSuggestedDescription());
            response.put("isAiProcessed", result.isAiProcessed());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error performing AI analysis: " + e.getMessage());
        }
    }

    @PostMapping("/draft-complaint")
    public ResponseEntity<?> draftComplaint(@RequestBody Map<String, String> payload) {
        try {
            String input = payload.get("input");
            String language = payload.getOrDefault("language", "EN");
            Map<String, String> result = aiCategorizationService.assistCitizenDraft(input, language);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error drafting complaint: " + e.getMessage());
        }
    }

    // ── 2. OFFICER: Smart Triage, Vendor Matchmaker & Citizen Response ───────
    @PostMapping("/suggest-vendor")
    public ResponseEntity<?> suggestVendor(@RequestBody Map<String, Object> payload) {
        try {
            Long complaintId = payload.get("complaintId") != null ? Long.valueOf(payload.get("complaintId").toString()) : null;
            String category = (String) payload.get("category");
            Map<String, Object> result = aiCategorizationService.suggestVendorMatch(complaintId, category);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error suggesting vendor: " + e.getMessage());
        }
    }

    @PostMapping("/suggest-response")
    public ResponseEntity<?> suggestResponse(@RequestBody Map<String, String> payload) {
        try {
            String title = payload.get("title");
            String description = payload.get("description");
            String category = payload.get("category");
            String status = payload.get("status");
            Map<String, String> result = aiCategorizationService.generateOfficerResponse(title, description, category, status);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error generating officer response: " + e.getMessage());
        }
    }

    // ── 3. VENDOR: AI Job Card & Visual Quality Assurance ────────────────────
    @PostMapping("/job-card")
    public ResponseEntity<?> vendorJobCard(@RequestBody Map<String, String> payload) {
        try {
            String title = payload.get("title");
            String description = payload.get("description");
            String category = payload.get("category");
            Map<String, Object> result = aiCategorizationService.generateVendorJobCard(title, description, category);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error generating vendor job card: " + e.getMessage());
        }
    }

    @PostMapping("/verify-resolution")
    public ResponseEntity<?> verifyResolution(@RequestBody Map<String, Object> payload) {
        try {
            String originalImageData = (String) payload.get("originalImageData");
            String completionImageData = (String) payload.get("completionImageData");
            String complaintTitle = (String) payload.get("complaintTitle");

            // If complaintId provided, fetch original image if not explicitly passed
            if ((originalImageData == null || originalImageData.isBlank()) && payload.get("complaintId") != null) {
                Long complaintId = Long.valueOf(payload.get("complaintId").toString());
                Complaint c = complaintRepository.findById(complaintId).orElse(null);
                if (c != null) {
                    originalImageData = c.getEvidenceImageData();
                    if (complaintTitle == null) complaintTitle = c.getTitle();
                }
            }

            Map<String, Object> result = aiCategorizationService.verifyResolutionVision(originalImageData, completionImageData, complaintTitle);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error verifying resolution: " + e.getMessage());
        }
    }

    // ── 4. REPRESENTATIVE: Briefing, Checklist & Escalation Memo ─────────────
    @PostMapping("/rep-briefing")
    public ResponseEntity<?> repBriefing(@RequestBody Map<String, String> payload) {
        try {
            String area = payload.get("area");
            Map<String, Object> result = aiCategorizationService.generateRepBriefing(area);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error generating representative briefing: " + e.getMessage());
        }
    }

    @PostMapping("/rep-escalation-memo")
    public ResponseEntity<?> repEscalationMemo(@RequestBody Map<String, Object> payload) {
        try {
            Long complaintId = Long.valueOf(payload.get("complaintId").toString());
            Map<String, String> result = aiCategorizationService.generateEscalationMemo(complaintId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error generating escalation memo: " + e.getMessage());
        }
    }

    @PostMapping("/field-checklist")
    public ResponseEntity<?> fieldChecklist(@RequestBody Map<String, String> payload) {
        try {
            String title = payload.get("title");
            String category = payload.get("category");
            Map<String, Object> result = aiCategorizationService.generateRepChecklist(title, category);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error generating field checklist: " + e.getMessage());
        }
    }

    // ── 5. ADMIN: Executive Governance Insights ─────────────────────────────
    @PostMapping("/admin-insights")
    public ResponseEntity<?> adminInsights(@RequestBody Map<String, Object> payload) {
        try {
            int total = ((Number) payload.getOrDefault("totalComplaints", 10)).intValue();
            int pending = ((Number) payload.getOrDefault("pendingCount", 3)).intValue();
            int resolved = ((Number) payload.getOrDefault("resolvedCount", 7)).intValue();
            Map<String, Object> result = aiCategorizationService.generateAdminInsights(total, pending, resolved);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error generating admin insights: " + e.getMessage());
        }
    }

    // ── 6. CONVERSATIONAL RAG CONTROL PLANE (All Roles) ─────────────────────
    @PostMapping("/chat")
    public ResponseEntity<?> aiChat(@RequestBody Map<String, String> payload) {
        try {
            String role = payload.getOrDefault("role", "CITIZEN");
            String message = payload.getOrDefault("message", "Hello");
            String language = payload.getOrDefault("language", "en");

            // Resolve authenticated user from security context
            User authenticatedUser = null;
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                authenticatedUser = userRepository.findByUsername(auth.getName()).orElse(null);
                if (authenticatedUser != null) {
                    role = authenticatedUser.getRole().name();
                }
            }

            // Fallback to username from request payload if principal is anonymous
            if (authenticatedUser == null && payload.get("username") != null && !payload.get("username").isBlank()) {
                authenticatedUser = userRepository.findByUsername(payload.get("username").trim()).orElse(null);
                if (authenticatedUser != null) {
                    role = authenticatedUser.getRole().name();
                }
            }

            // Execute Grounded RAG Chat
            String reply = aiCategorizationService.processRoleAIChatWithRag(authenticatedUser, role, message, language);
            return ResponseEntity.ok(Map.of("reply", reply));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error in RAG AI chat: " + e.getMessage());
        }
    }
}
