package com.project.Complaint.system.service;

import com.project.Complaint.system.event.ComplaintCreatedEvent;
import com.project.Complaint.system.event.ComplaintReopenedEvent;
import com.project.Complaint.system.event.ComplaintStatusChangedEvent;
import com.project.Complaint.system.event.DuplicateDetectedEvent;
import com.project.Complaint.system.model.*;
import com.project.Complaint.system.repository.AssignmentRepository;
import com.project.Complaint.system.repository.CategoryRepository;
import com.project.Complaint.system.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.grievance.ai.AIAssistantService;
import com.grievance.ai.AIAnalysisResult;
import com.grievance.ai.DuplicateCheckResult;
import org.springframework.scheduling.annotation.Async;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ComplaintService {

    private static final Logger log = LoggerFactory.getLogger(ComplaintService.class);

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private AICategorizationService aiCategorizationService;

    @Autowired
    private AIAssistantService aiAssistantService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    // Create complaint
    public ComplaintResponse createComplaint(CreateComplaintRequest request, User citizen) {
        // Step 1: Call combined AI analysis (detect language, translate, categorize, severity)
        AIAnalysisResult aiResult = aiAssistantService.analyzeComplaint(
                request.getTitle(), request.getDescription());

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId()).orElse(null);
        }
        if (category == null && aiResult != null && aiResult.category() != null) {
            category = categoryRepository.findByName(aiResult.category()).orElse(null);
        }
        if (category == null) {
            category = categoryRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("No categories configured in system"));
        }

        Complaint complaint = new Complaint();
        complaint.setCitizen(citizen);
        complaint.setCategory(category);
        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setLocation(request.getLocation());
        complaint.setEvidenceImageData(request.getEvidenceImageData());
        complaint.setEvidenceFileName(request.getEvidenceFileName());
        complaint.setEvidenceContentType(request.getEvidenceContentType());

        // Save AI analysis results
        if (aiResult != null) {
            complaint.setDetectedLanguage(aiResult.detectedLanguage());
            complaint.setAiCategory(aiResult.category());
            complaint.setAiCategoryName(aiResult.category());
            complaint.setAiSeverity(aiResult.severity());
            complaint.setAiSeverityScore(aiResult.severity());
            complaint.setSeverityScore(aiResult.severity());
            complaint.setAiConfirmed(false);
            complaint.setIsAiProcessed(true);
            complaint.setSlaTargetHours(48);
            complaint.setSlaDeadline(LocalDateTime.now().plusHours(48));
        }

        complaint.setStatus(ComplaintStatus.RECEIVED);

        // Step 2: Geolocation Duplicate Check (200m radius)
        if (request.getLatitude() != null && request.getLongitude() != null) {
            double lat = request.getLatitude();
            double lng = request.getLongitude();
            complaint.setLatitude(BigDecimal.valueOf(lat));
            complaint.setLongitude(BigDecimal.valueOf(lng));

            List<Complaint> nearbyOpen = complaintRepository.findNearbyOpenComplaints(lat, lng, 200.0);
            if (nearbyOpen != null && !nearbyOpen.isEmpty()) {
                List<String> nearbyTexts = nearbyOpen.stream()
                        .map(c -> c.getTitle() + " - " + c.getDescription())
                        .collect(Collectors.toList());

                String newComplaintText = (aiResult != null && aiResult.translatedText() != null)
                        ? aiResult.translatedText()
                        : (request.getTitle() + " - " + request.getDescription());

                DuplicateCheckResult dupCheck = aiAssistantService.checkDuplicate(newComplaintText, nearbyTexts);
                if (dupCheck.isDuplicate() && dupCheck.matchedIndex() >= 0 && dupCheck.matchedIndex() < nearbyOpen.size()) {
                    Complaint matchedComplaint = nearbyOpen.get(dupCheck.matchedIndex());
                    complaint.setDuplicateOfId(matchedComplaint.getComplaintId());
                    complaint.setDuplicateOfComplaintId(matchedComplaint.getComplaintId());
                    complaint.setIsDuplicate(true);
                    complaint.setStatus(ComplaintStatus.FLAGGED_DUPLICATE);
                }
            }
        }

        Complaint saved = complaintRepository.save(complaint);

        // Generate complaintRef GRV-2026-XXXXXX
        String ref = "GRV-2026-" + String.format("%06d", saved.getComplaintId());
        saved.setComplaintRef(ref);
        saved = complaintRepository.save(saved);

        // Publish ComplaintCreatedEvent
        eventPublisher.publishEvent(new ComplaintCreatedEvent(this, saved));

        return new ComplaintResponse(saved);
    }

    @Async
    public void processAiAnalysisAsync(Long complaintId, String title, String description) {
        try {
            AIAnalysisResult aiResult = aiAssistantService.analyzeComplaint(title, description);
            Complaint complaint = complaintRepository.findById(complaintId).orElse(null);
            if (complaint != null) {
                complaint.setDetectedLanguage(aiResult.detectedLanguage());
                complaint.setAiCategory(aiResult.category());
                complaint.setAiSeverity(aiResult.severity());
                complaint.setAiSeverityScore(aiResult.severity());
                complaint.setSeverityScore(aiResult.severity());
                complaint.setAiConfirmed(false);
                complaint.setIsAiProcessed(true);
                complaintRepository.save(complaint);
            }
        } catch (Exception e) {
            log.error("Async AI analysis failed for complaint ID: {}", complaintId, e);
        }
    }

    public ComplaintResponse confirmAiCategory(Long complaintId, String overrideCategoryName) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found: " + complaintId));

        String categoryToUse = (overrideCategoryName != null && !overrideCategoryName.isBlank())
                ? overrideCategoryName
                : complaint.getAiCategory();

        if (categoryToUse != null && !categoryToUse.isBlank()) {
            complaint.setAiCategory(categoryToUse);
            Category category = categoryRepository.findByName(categoryToUse).orElse(null);
            if (category == null) {
                category = categoryRepository.findAll().stream().findFirst().orElse(null);
            }
            if (category != null) {
                complaint.setCategory(category);
            }
        }

        complaint.setAiConfirmed(true);
        Complaint updated = complaintRepository.save(complaint);
        return new ComplaintResponse(updated);
    }

    private void checkPossibleDuplicate(Complaint newComplaint) {
        if (newComplaint.getCategory() == null) return;
        List<Complaint> active = complaintRepository.findByStatusNotIn(List.of(ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED, ComplaintStatus.REJECTED));
        for (Complaint existing : active) {
            if (existing.getComplaintId().equals(newComplaint.getComplaintId())) continue;
            
            boolean sameCategory = existing.getCategory() != null && existing.getCategory().getCategoryId().equals(newComplaint.getCategory().getCategoryId());
            boolean similarTitle = existing.getTitle() != null && newComplaint.getTitle() != null &&
                    (existing.getTitle().equalsIgnoreCase(newComplaint.getTitle()) || 
                     existing.getTitle().toLowerCase().contains(newComplaint.getTitle().toLowerCase()));
            
            if (sameCategory && similarTitle) {
                newComplaint.setIsDuplicate(true);
                newComplaint.setDuplicateOfComplaintId(existing.getComplaintId());
                newComplaint.setDuplicateSimilarityScore(0.88);
                newComplaint.setStatus(ComplaintStatus.DUPLICATE);
                complaintRepository.save(newComplaint);

                eventPublisher.publishEvent(new DuplicateDetectedEvent(this, newComplaint, existing, 0.88));
                break;
            }
        }
    }

    public ComplaintResponse buildComplaintResponseWithAssignment(Complaint complaint) {
        ComplaintResponse resp = new ComplaintResponse(complaint);
        if (assignmentRepository != null) {
            assignmentRepository.findByComplaint_ComplaintId(complaint.getComplaintId()).ifPresent(a -> {
                resp.setWorkOrderNumber(a.getWorkOrderNumber());
                resp.setDepartment(a.getDepartment());
                if (a.getVendor() != null) {
                    resp.setAssignedVendorId(a.getVendor().getUserId());
                    resp.setAssignedVendorName(a.getVendor().getFullName() != null ? a.getVendor().getFullName() : a.getVendor().getUsername());
                    resp.setAssignedVendorUsername(a.getVendor().getUsername());
                    resp.setAssignedVendorDesignation(a.getVendor().getDesignation() != null ? a.getVendor().getDesignation() : "Contractor");
                }
                resp.setAssignmentStatus(a.getStatus() != null ? a.getStatus().name() : "ASSIGNED");
                resp.setAssignedAt(a.getAssignedAt());
                resp.setStartEvidenceImageData(a.getStartEvidenceImageData());
                resp.setCompletionEvidenceImageData(a.getCompletionEvidenceImageData());
                resp.setAssignmentLatitude(a.getLatitude());
                resp.setAssignmentLongitude(a.getLongitude());
                resp.setAiVerificationScore(a.getAiVerificationScore());
                resp.setAiVerificationNote(a.getAiVerificationNote());
                resp.setAssignmentNotes(a.getNotes());
            });
        }
        return resp;
    }

    // Get complaint by ID
    public ComplaintResponse getComplaintById(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        return buildComplaintResponseWithAssignment(complaint);
    }

    public ComplaintResponse getComplaintByRef(String complaintRef) {
        Complaint complaint = complaintRepository.findByComplaintRef(complaintRef)
                .orElseThrow(() -> new RuntimeException("Complaint not found for ref: " + complaintRef));
        return buildComplaintResponseWithAssignment(complaint);
    }

    // Get complaints by citizen
    public List<ComplaintResponse> getComplaintsByCitizen(User citizen) {
        List<Complaint> complaints = complaintRepository.findByCitizen(citizen);
        return complaints.stream()
                .map(this::buildComplaintResponseWithAssignment)
                .collect(Collectors.toList());
    }

    // Get all complaints (for officers)
    public Page<ComplaintResponse> getAllComplaints(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Complaint> complaints = complaintRepository.findAll(pageable);
        return complaints.map(this::buildComplaintResponseWithAssignment);
    }

    // Get complaints by status
    public Page<ComplaintResponse> getComplaintsByStatus(ComplaintStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("severityScore").descending());
        Page<Complaint> complaints = complaintRepository.findByStatus(status, pageable);
        return complaints.map(this::buildComplaintResponseWithAssignment);
    }

    // Update complaint status
    public ComplaintResponse updateStatus(Long complaintId, ComplaintStatus newStatus, String officialNote, User actor) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(newStatus);
        
        if (newStatus == ComplaintStatus.RESOLVED) {
            complaint.setResolvedAt(LocalDateTime.now());
            if (officialNote != null) complaint.setResolutionNote(officialNote);
        }

        Complaint updated = complaintRepository.save(complaint);

        // Publish status change event
        eventPublisher.publishEvent(new ComplaintStatusChangedEvent(this, updated, oldStatus, newStatus, officialNote, actor));

        return new ComplaintResponse(updated);
    }

    // Reopen complaint
    public ComplaintResponse reopenComplaint(Long complaintId, String reason, String newEvidenceData, User citizen) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.REOPENED);
        complaint.setReopenReason(reason);
        complaint.setReopenedAt(LocalDateTime.now());
        complaint.setReopenCount(complaint.getReopenCount() != null ? complaint.getReopenCount() + 1 : 1);
        complaint.setCitizenFeedback("NOT_SOLVED");

        if (newEvidenceData != null && !newEvidenceData.isBlank()) {
            complaint.setEvidenceImageData(newEvidenceData);
        }

        Complaint saved = complaintRepository.save(complaint);

        eventPublisher.publishEvent(new ComplaintReopenedEvent(this, saved, reason));
        eventPublisher.publishEvent(new ComplaintStatusChangedEvent(this, saved, oldStatus, ComplaintStatus.REOPENED, "Citizen reopened issue: " + reason, citizen));

        return new ComplaintResponse(saved);
    }

    // Record citizen feedback
    public ComplaintResponse recordFeedback(Long complaintId, String feedback, Integer rating, String comment, User citizen) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        complaint.setCitizenFeedback(feedback);
        if (rating != null) complaint.setFeedbackRating(rating);
        if (comment != null) complaint.setFeedbackComment(comment);

        Complaint saved = complaintRepository.save(complaint);
        return new ComplaintResponse(saved);
    }
}
