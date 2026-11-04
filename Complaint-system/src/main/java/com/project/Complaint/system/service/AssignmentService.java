package com.project.Complaint.system.service;

import com.project.Complaint.system.model.*;
import com.project.Complaint.system.repository.AssignmentRepository;
import com.project.Complaint.system.repository.ComplaintRepository;
import com.project.Complaint.system.repository.UserRepository;
import com.project.Complaint.system.repository.VendorContractRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AssignmentService {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VendorContractRepository contractRepository;

    @Autowired
    private VendorContractService vendorContractService;

    @Autowired
    private EmailNotificationService notificationService;

    // Assign complaint to vendor with contract validation, work order generation, and department requirements
    @Transactional
    public AssignmentResponse assignToVendor(AssignmentRequest request, User officer) {
        // 1. Find complaint
        Complaint complaint = complaintRepository.findById(request.getComplaintId())
                .orElseThrow(() -> new RuntimeException("Complaint not found with ID: " + request.getComplaintId()));

        // 2. Find vendor
        User vendor = userRepository.findById(request.getVendorId())
                .orElseThrow(() -> new RuntimeException("Vendor not found with ID: " + request.getVendorId()));

        // 3. Verify vendor role
        if (vendor.getRole() != Role.VENDOR) {
            throw new RuntimeException("Selected user is not a registered vendor contractor");
        }

        // 4. Check if active assignment already exists for this complaint
        Optional<Assignment> existingAssignmentOpt = assignmentRepository.findFirstByComplaint_ComplaintIdOrderByAssignmentIdDesc(complaint.getComplaintId());
        if (existingAssignmentOpt.isPresent()) {
            Assignment existing = existingAssignmentOpt.get();
            if (existing.getStatus() != AssignmentStatus.REJECTED) {
                throw new RuntimeException("Complaint is already assigned to vendor " + existing.getVendor().getUsername() + " (Work Order: " + existing.getWorkOrderNumber() + ")");
            }
        }

        // 5. Determine department
        String department = request.getDepartment();
        if (department == null || department.isBlank()) {
            String catName = complaint.getCategory() != null ? complaint.getCategory().getName() : complaint.getAiCategoryName();
            department = resolveDepartmentFromCategory(catName);
        }

        // 6. Find contract
        VendorContract contract = null;
        if (request.getContractId() != null) {
            contract = contractRepository.findById(request.getContractId()).orElse(null);
        }
        if (contract == null) {
            contract = vendorContractService.findActiveContract(vendor, department);
        }

        // 7. Eligibility validations
        boolean hasActiveContract = (contract != null && contract.getStatus() == ContractStatus.ACTIVE
                && (contract.getExpiryDate() == null || !contract.getExpiryDate().isBefore(LocalDate.now())));

        long activeTasks = assignmentRepository.countByVendorAndStatusIn(vendor, List.of(AssignmentStatus.ASSIGNED, AssignmentStatus.ACCEPTED, AssignmentStatus.IN_PROGRESS));
        boolean workloadExceeded = activeTasks >= 5;

        // Ward check
        boolean wardCovered = true;
        if (contract != null && contract.getCoveredWards() != null && !contract.getCoveredWards().equalsIgnoreCase("All Wards")) {
            String loc = complaint.getLocation() != null ? complaint.getLocation().toLowerCase() : "";
            String covered = contract.getCoveredWards().toLowerCase();
            // If location specifies a ward, check if listed in contract
            if (loc.contains("ward")) {
                java.util.regex.Matcher m = java.util.regex.Pattern.compile("ward\\s*(\\d+)", java.util.regex.Pattern.CASE_INSENSITIVE).matcher(loc);
                if (m.find()) {
                    String wardToken = m.group(1);
                    if (!covered.contains(wardToken)) {
                        wardCovered = false;
                    }
                }
            }
        }

        boolean isOverride = Boolean.TRUE.equals(request.getOverrideIneligible());
        if (!isOverride) {
            if (!hasActiveContract) {
                throw new IllegalArgumentException("Contract Eligibility Error: Vendor @" + vendor.getUsername() + " does not hold an active, valid government contract for department '" + department + "'. Authorized officer override required.");
            }
            if (workloadExceeded) {
                throw new IllegalArgumentException("Workload Capacity Error: Vendor @" + vendor.getUsername() + " currently has " + activeTasks + " active tasks (Capacity: 5). Authorized officer override required.");
            }
            if (!wardCovered) {
                throw new IllegalArgumentException("Service Area Error: Complaint location is outside vendor's contracted service area (" + contract.getCoveredWards() + "). Authorized officer override required.");
            }
        }

        // 8. SLA and Deadlines
        int contractSla = (contract != null && contract.getContractSlaHours() != null) ? contract.getContractSlaHours() : 24;
        int estimatedHours = (request.getEstimatedHours() != null && request.getEstimatedHours() > 0) ? request.getEstimatedHours() : contractSla;
        LocalDateTime slaDeadline = LocalDateTime.now().plusHours(contractSla);

        // 9. Generate Work Order Number: WO-2026-{DEPT}-{COMPLAINT_ID_PADDED}
        String deptCode = getDepartmentCode(department);
        String baseWo = String.format("WO-2026-%s-%06d", deptCode, complaint.getComplaintId());
        String workOrderNumber = baseWo;
        int attempt = 1;
        while (assignmentRepository.findByWorkOrderNumber(workOrderNumber).isPresent()) {
            workOrderNumber = baseWo + "-R" + attempt++;
        }

        // 10. Build Assignment
        Assignment assignment = new Assignment(complaint, vendor, officer);
        assignment.setWorkOrderNumber(workOrderNumber);
        assignment.setContract(contract);
        assignment.setDepartment(department);
        assignment.setDepartmentRequirements(request.getDepartmentRequirements());
        assignment.setWorkInstructions(request.getWorkInstructions());
        assignment.setEstimatedHours(estimatedHours);
        assignment.setSlaDeadline(slaDeadline);
        assignment.setStatus(AssignmentStatus.ASSIGNED);
        assignment.setAssignedAt(LocalDateTime.now());

        if (isOverride) {
            String overrideNote = "[AUTHORIZED OVERRIDE by Officer @" + officer.getUsername() + ": "
                    + (request.getOverrideReason() != null ? request.getOverrideReason() : "Discretionary Assignment") + "]";
            assignment.setNotes(request.getNotes() != null && !request.getNotes().isBlank() ? request.getNotes() + " | " + overrideNote : overrideNote);
        } else {
            assignment.setNotes(request.getNotes());
        }

        // 11. Update complaint status
        complaint.setStatus(ComplaintStatus.ASSIGNED);
        complaint.setSlaTargetHours(contractSla);
        complaint.setSlaDeadline(slaDeadline);
        complaintRepository.save(complaint);

        Assignment saved = assignmentRepository.save(assignment);

        // 12. Send notifications
        try {
            String vEmail = vendor.getEmail();
            notificationService.sendEmail(vendor, vEmail, complaint.getComplaintRef(), complaint.getComplaintId(),
                    "WORK_ORDER_ASSIGNED",
                    "New Work Order " + workOrderNumber + " Assigned - " + department,
                    String.format("<p>You have been assigned <b>Work Order %s</b> for ticket <b>%s</b> (%s).</p><p><b>SLA Deadline:</b> %s</p><p>Please log in to your contractor portal to accept or reject the assignment.</p>",
                            workOrderNumber, complaint.getComplaintRef(), complaint.getTitle(), slaDeadline.toString()),
                    String.format("Work Order %s assigned for %s. SLA Deadline: %s", workOrderNumber, complaint.getTitle(), slaDeadline.toString()),
                    vendor.getPreferredLanguage());

            if (complaint.getCitizen() != null) {
                notificationService.sendEmail(complaint.getCitizen(), complaint.getCitizen().getEmail(), complaint.getComplaintRef(), complaint.getComplaintId(),
                        "COMPLAINT_ASSIGNED",
                        "Contractor Assigned to Grievance " + complaint.getComplaintRef(),
                        String.format("<p>Your grievance <b>%s</b> has been assigned to municipal contractor <b>%s</b> under Work Order <b>%s</b>.</p><p>Target SLA: %s hours.</p>",
                                complaint.getComplaintRef(), (vendor.getFullName() != null ? vendor.getFullName() : vendor.getUsername()), workOrderNumber, contractSla),
                        String.format("Grievance %s assigned to contractor %s under %s.", complaint.getComplaintRef(), vendor.getUsername(), workOrderNumber),
                        complaint.getCitizen().getPreferredLanguage());
            }
        } catch (Exception ignored) {}

        return new AssignmentResponse(saved);
    }

    // Vendor accepts assignment
    @Transactional
    public AssignmentResponse vendorAcceptAssignment(Long assignmentId, User vendor) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found with ID: " + assignmentId));

        if (!assignment.getVendor().getUserId().equals(vendor.getUserId())) {
            throw new RuntimeException("You are not assigned to this work order.");
        }

        if (assignment.getStatus() != AssignmentStatus.ASSIGNED) {
            throw new RuntimeException("Work order cannot be accepted because it is currently in status: " + assignment.getStatus());
        }

        assignment.setStatus(AssignmentStatus.ACCEPTED);
        assignment.setAcceptedAt(LocalDateTime.now());

        Complaint complaint = assignment.getComplaint();
        if (complaint != null) {
            complaint.setStatus(ComplaintStatus.VENDOR_ACCEPTED);
            complaintRepository.save(complaint);
        }

        Assignment updated = assignmentRepository.save(assignment);

        try {
            if (assignment.getAssignedBy() != null) {
                notificationService.sendEmail(assignment.getAssignedBy(), assignment.getAssignedBy().getEmail(),
                        complaint != null ? complaint.getComplaintRef() : "WO-" + assignmentId,
                        complaint != null ? complaint.getComplaintId() : assignmentId,
                        "WORK_ORDER_ACCEPTED",
                        "Vendor Accepted Work Order " + assignment.getWorkOrderNumber(),
                        String.format("<p>Contractor <b>%s</b> has <b>ACCEPTED</b> Work Order <b>%s</b>.</p>",
                                (vendor.getFullName() != null ? vendor.getFullName() : vendor.getUsername()), assignment.getWorkOrderNumber()),
                        "Vendor " + vendor.getUsername() + " accepted Work Order " + assignment.getWorkOrderNumber(),
                        assignment.getAssignedBy().getPreferredLanguage());
            }
        } catch (Exception ignored) {}

        return new AssignmentResponse(updated);
    }

    // Vendor rejects assignment
    @Transactional
    public AssignmentResponse vendorRejectAssignment(Long assignmentId, String rejectionReason, User vendor) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found with ID: " + assignmentId));

        if (!assignment.getVendor().getUserId().equals(vendor.getUserId())) {
            throw new RuntimeException("You are not assigned to this work order.");
        }

        if (assignment.getStatus() != AssignmentStatus.ASSIGNED && assignment.getStatus() != AssignmentStatus.ACCEPTED) {
            throw new RuntimeException("Work order cannot be rejected once in progress or completed.");
        }

        String reason = (rejectionReason != null && !rejectionReason.isBlank()) ? rejectionReason.trim() : "Vendor declined without stated reason";
        assignment.setStatus(AssignmentStatus.REJECTED);
        assignment.setRejectedAt(LocalDateTime.now());
        assignment.setRejectionReason(reason);

        Complaint complaint = assignment.getComplaint();
        if (complaint != null) {
            complaint.setStatus(ComplaintStatus.OFFICER_REVIEW);
            complaintRepository.save(complaint);
        }

        Assignment updated = assignmentRepository.save(assignment);

        try {
            if (assignment.getAssignedBy() != null) {
                notificationService.sendEmail(assignment.getAssignedBy(), assignment.getAssignedBy().getEmail(),
                        complaint != null ? complaint.getComplaintRef() : "WO-" + assignmentId,
                        complaint != null ? complaint.getComplaintId() : assignmentId,
                        "WORK_ORDER_REJECTED",
                        "ALERT: Work Order " + assignment.getWorkOrderNumber() + " Rejected by Contractor",
                        String.format("<p>Contractor <b>%s</b> has <b>REJECTED</b> Work Order <b>%s</b>.</p><p><b>Reason:</b> %s</p><p>The grievance has returned to Officer Review for reassignment.</p>",
                                (vendor.getFullName() != null ? vendor.getFullName() : vendor.getUsername()), assignment.getWorkOrderNumber(), reason),
                        "Work order " + assignment.getWorkOrderNumber() + " rejected. Reason: " + reason,
                        assignment.getAssignedBy().getPreferredLanguage());
            }
        } catch (Exception ignored) {}

        return new AssignmentResponse(updated);
    }

    // Officer verifies department completion
    @Transactional
    public AssignmentResponse verifyCompletion(Long assignmentId, String verificationStatus, String remarks, User officer) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found with ID: " + assignmentId));

        if (assignment.getStatus() != AssignmentStatus.COMPLETED) {
            throw new RuntimeException("Cannot verify task. Task status is currently: " + assignment.getStatus() + ". It must be COMPLETED.");
        }

        Complaint complaint = assignment.getComplaint();

        if ("APPROVED".equalsIgnoreCase(verificationStatus)) {
            assignment.setStatus(AssignmentStatus.VERIFIED);
            assignment.setVerifiedAt(LocalDateTime.now());
            assignment.setVerificationStatus("APPROVED");
            assignment.setVerificationRemarks(remarks);

            if (complaint != null) {
                complaint.setStatus(ComplaintStatus.RESOLVED);
                complaint.setResolvedAt(LocalDateTime.now());
                if (remarks != null && !remarks.isBlank()) {
                    complaint.setResolutionNote(remarks);
                }
                complaintRepository.save(complaint);
            }

            try {
                // Notify Citizen
                if (complaint != null && complaint.getCitizen() != null) {
                    notificationService.sendEmail(complaint.getCitizen(), complaint.getCitizen().getEmail(),
                            complaint.getComplaintRef(), complaint.getComplaintId(),
                            "COMPLAINT_RESOLVED",
                            "Grievance " + complaint.getComplaintRef() + " Resolved & Verified",
                            String.format("<p>Your grievance <b>%s</b> has been inspected, verified, and officially <b>RESOLVED</b> by Officer @%s.</p><p>Officer remarks: %s</p><p>Please take a moment to rate the repair service.</p>",
                                    complaint.getComplaintRef(), officer.getUsername(), remarks != null ? remarks : "Work completed satisfactorily"),
                            "Grievance " + complaint.getComplaintRef() + " verified and resolved.",
                            complaint.getCitizen().getPreferredLanguage());
                }
                // Notify Vendor
                if (assignment.getVendor() != null) {
                    notificationService.sendEmail(assignment.getVendor(), assignment.getVendor().getEmail(),
                            complaint != null ? complaint.getComplaintRef() : "WO-" + assignmentId,
                            complaint != null ? complaint.getComplaintId() : assignmentId,
                            "WORK_ORDER_VERIFIED",
                            "Work Order " + assignment.getWorkOrderNumber() + " Verified & Approved",
                            String.format("<p>Your completed work on Work Order <b>%s</b> has been verified and approved by Officer @%s.</p>",
                                    assignment.getWorkOrderNumber(), officer.getUsername()),
                            "Work Order " + assignment.getWorkOrderNumber() + " approved.",
                            assignment.getVendor().getPreferredLanguage());
                }
            } catch (Exception ignored) {}

        } else if ("REJECTED_REWORK".equalsIgnoreCase(verificationStatus)) {
            assignment.setStatus(AssignmentStatus.IN_PROGRESS);
            assignment.setVerificationStatus("REWORK_REQUESTED");
            assignment.setVerificationRemarks(remarks);

            if (complaint != null) {
                complaint.setStatus(ComplaintStatus.IN_PROGRESS);
                complaintRepository.save(complaint);
            }

            try {
                if (assignment.getVendor() != null) {
                    notificationService.sendEmail(assignment.getVendor(), assignment.getVendor().getEmail(),
                            complaint != null ? complaint.getComplaintRef() : "WO-" + assignmentId,
                            complaint != null ? complaint.getComplaintId() : assignmentId,
                            "WORK_ORDER_REWORK_REQUESTED",
                            "ACTION REQUIRED: Rework Requested for Work Order " + assignment.getWorkOrderNumber(),
                            String.format("<p>Officer @%s has requested rework on Work Order <b>%s</b>.</p><p><b>Inspection Remarks:</b> %s</p><p>Please rectify the identified deficiencies and submit updated completion evidence.</p>",
                                    officer.getUsername(), assignment.getWorkOrderNumber(), remarks != null ? remarks : "Quality checks incomplete"),
                            "Rework requested for Work Order " + assignment.getWorkOrderNumber(),
                            assignment.getVendor().getPreferredLanguage());
                }
            } catch (Exception ignored) {}
        } else {
            throw new IllegalArgumentException("Invalid verification status. Must be 'APPROVED' or 'REJECTED_REWORK'.");
        }

        Assignment updated = assignmentRepository.save(assignment);
        return new AssignmentResponse(updated);
    }

    // Get assignments for vendor
    public List<AssignmentResponse> getVendorAssignments(User vendor) {
        List<Assignment> assignments = assignmentRepository.findByVendor(vendor);
        return assignments.stream()
                .map(AssignmentResponse::new)
                .collect(Collectors.toList());
    }

    // Get assignments by status for vendor
    public List<AssignmentResponse> getVendorAssignmentsByStatus(User vendor, AssignmentStatus status) {
        List<Assignment> assignments = assignmentRepository.findByVendorAndStatus(vendor, status);
        return assignments.stream()
                .map(AssignmentResponse::new)
                .collect(Collectors.toList());
    }

    // Update assignment status (vendor updates progress: IN_PROGRESS or COMPLETED)
    @Transactional
    public AssignmentResponse updateAssignmentStatus(Long assignmentId, UpdateStatusRequest request, User vendor) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found with ID: " + assignmentId));

        if (!assignment.getVendor().getUserId().equals(vendor.getUserId())) {
            throw new RuntimeException("You are not assigned to this complaint");
        }

        AssignmentStatus currentStatus = assignment.getStatus();
        AssignmentStatus newStatus = AssignmentStatus.valueOf(request.getStatus().toUpperCase());

        // ── 1. Sequential Workflow Validation: Linked One After Another ──
        // Pipeline: ASSIGNED / ACCEPTED (1) ➔ IN_PROGRESS (2) ➔ COMPLETED (3) ➔ VERIFIED (4)
        if (currentStatus == AssignmentStatus.ASSIGNED || currentStatus == AssignmentStatus.ACCEPTED) {
            if (newStatus != AssignmentStatus.IN_PROGRESS && newStatus != AssignmentStatus.ACCEPTED) {
                throw new IllegalArgumentException("Sequential Workflow Error: Task must progress to IN_PROGRESS (Step 2) with arrival proof before completing or verifying.");
            }
        } else if (currentStatus == AssignmentStatus.IN_PROGRESS) {
            if (newStatus == AssignmentStatus.ASSIGNED || newStatus == AssignmentStatus.ACCEPTED) {
                throw new IllegalArgumentException("Sequential Workflow Error: Cannot move task backwards once IN_PROGRESS (Step 2).");
            }
            if (newStatus == AssignmentStatus.VERIFIED) {
                throw new IllegalArgumentException("Sequential Workflow Error: Task must be marked COMPLETED (Step 3) with after-repair completion proof before officer verification.");
            }
        } else if (currentStatus == AssignmentStatus.COMPLETED) {
            if (newStatus == AssignmentStatus.ASSIGNED || newStatus == AssignmentStatus.ACCEPTED || newStatus == AssignmentStatus.IN_PROGRESS) {
                throw new IllegalArgumentException("Sequential Workflow Error: Cannot revert task backwards once work has been marked COMPLETED (Step 3).");
            }
        } else if (currentStatus == AssignmentStatus.VERIFIED) {
            if (newStatus != AssignmentStatus.VERIFIED) {
                throw new IllegalArgumentException("Task has already been VERIFIED (Step 4) and finalized. No further status changes are permitted.");
            }
        }

        // ── 2. Evidence Guardrail & Anti-Duplicate Validation ─────────────────────
        if (newStatus == AssignmentStatus.IN_PROGRESS) {
            if (request.getEvidenceImageData() == null || request.getEvidenceImageData().trim().isEmpty()) {
                if (assignment.getStartEvidenceImageData() == null || assignment.getStartEvidenceImageData().trim().isEmpty()) {
                    throw new IllegalArgumentException("Evidence Required: Please upload on-site arrival photo evidence before marking work IN_PROGRESS.");
                }
            } else {
                assignment.setStartEvidenceImageData(request.getEvidenceImageData());
            }
            if (request.getLatitude() != null) assignment.setLatitude(request.getLatitude());
            if (request.getLongitude() != null) assignment.setLongitude(request.getLongitude());
        } else if (newStatus == AssignmentStatus.COMPLETED) {
            if (request.getEvidenceImageData() == null || request.getEvidenceImageData().trim().isEmpty()) {
                throw new IllegalArgumentException("Evidence Required: Please upload after-repair completion photo evidence before marking task COMPLETED.");
            }

            // Anti-Fraud check: Completion photo cannot be identical to in-progress arrival photo
            if (isSameImage(request.getEvidenceImageData(), assignment.getStartEvidenceImageData())) {
                throw new IllegalArgumentException("Invalid Evidence: After-repair completion photo cannot be the same photo as the on-site arrival (In Progress) photo. Please upload a genuine photo showing the completed work.");
            }

            // Anti-Fraud check: Completion photo cannot be identical to citizen reported photo
            if (assignment.getComplaint() != null && isSameImage(request.getEvidenceImageData(), assignment.getComplaint().getEvidenceImageData())) {
                throw new IllegalArgumentException("Invalid Evidence: After-repair completion photo cannot be the same photo as the citizen's original reported grievance photo. Please upload a genuine photo showing the completed work.");
            }

            assignment.setCompletionEvidenceImageData(request.getEvidenceImageData());
            if (request.getLatitude() != null) assignment.setLatitude(request.getLatitude());
            if (request.getLongitude() != null) assignment.setLongitude(request.getLongitude());
            if (request.getAiVerificationScore() != null) assignment.setAiVerificationScore(request.getAiVerificationScore());
            if (request.getAiVerificationNote() != null) assignment.setAiVerificationNote(request.getAiVerificationNote());

            // Mirror completion evidence onto complaint for officer and citizen verification
            Complaint comp = assignment.getComplaint();
            if (comp != null) {
                comp.setResolutionEvidenceImageData(request.getEvidenceImageData());
                comp.setResolutionLatitude(request.getLatitude());
                comp.setResolutionLongitude(request.getLongitude());
                comp.setAiResolutionScore(request.getAiVerificationScore());
                comp.setAiResolutionNote(request.getAiVerificationNote());
            }
        }

        assignment.setStatus(newStatus);
        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            assignment.setNotes(request.getNotes());
        }

        // Update complaint status based on assignment status
        Complaint complaint = assignment.getComplaint();
        if (complaint != null) {
            if (newStatus == AssignmentStatus.IN_PROGRESS) {
                complaint.setStatus(ComplaintStatus.IN_PROGRESS);
            } else if (newStatus == AssignmentStatus.COMPLETED) {
                complaint.setStatus(ComplaintStatus.RESOLVED);
                assignment.setCompletedAt(LocalDateTime.now());
                complaint.setResolvedAt(LocalDateTime.now());
                if (request.getNotes() != null && !request.getNotes().isBlank()) {
                    complaint.setResolutionNote(request.getNotes());
                }
            } else if (newStatus == AssignmentStatus.VERIFIED) {
                complaint.setStatus(ComplaintStatus.VERIFIED);
            }
            complaintRepository.save(complaint);
        }

        Assignment updated = assignmentRepository.save(assignment);
        return new AssignmentResponse(updated);
    }

    // Get assignment by complaint ID
    public AssignmentResponse getAssignmentByComplaintId(Long complaintId) {
        Assignment assignment = assignmentRepository.findFirstByComplaint_ComplaintIdOrderByAssignmentIdDesc(complaintId)
                .orElseThrow(() -> new RuntimeException("No assignment found for complaint ID: " + complaintId));
        return new AssignmentResponse(assignment);
    }

    // Get assignment by assignment ID
    public AssignmentResponse getAssignmentById(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found with ID: " + assignmentId));
        return new AssignmentResponse(assignment);
    }

    // Get all assignments (for admin/officer)
    public List<AssignmentResponse> getAllAssignments() {
        List<Assignment> assignments = assignmentRepository.findAll();
        return assignments.stream()
                .map(AssignmentResponse::new)
                .collect(Collectors.toList());
    }

    public String resolveDepartmentFromCategory(String categoryName) {
        if (categoryName == null) return "Road Maintenance";
        String lower = categoryName.toLowerCase();
        if (lower.contains("road") || lower.contains("pothole") || lower.contains("asphalt") || lower.contains("traffic") || lower.contains("footpath")) {
            return "Road Maintenance";
        }
        if (lower.contains("water") || lower.contains("drain") || lower.contains("pipe") || lower.contains("sewage") || lower.contains("leak") || lower.contains("jal")) {
            return "Water Supply";
        }
        if (lower.contains("electr") || lower.contains("light") || lower.contains("power") || lower.contains("grid") || lower.contains("pole") || lower.contains("wire")) {
            return "Electrical Maintenance";
        }
        if (lower.contains("garb") || lower.contains("waste") || lower.contains("sanitat") || lower.contains("trash") || lower.contains("dump") || lower.contains("clean")) {
            return "Sanitation and Waste Management";
        }
        return "Road Maintenance";
    }

    public String getDepartmentCode(String dept) {
        if (dept == null) return "GEN";
        String lower = dept.toLowerCase();
        if (lower.contains("road")) return "RD";
        if (lower.contains("water") || lower.contains("drain")) return "WS";
        if (lower.contains("electr") || lower.contains("light")) return "EM";
        if (lower.contains("sanit") || lower.contains("garb") || lower.contains("waste")) return "SW";
        return "GEN";
    }

    private boolean isSameImage(String img1, String img2) {
        if (img1 == null || img2 == null) return false;
        String clean1 = cleanImageData(img1);
        String clean2 = cleanImageData(img2);
        return !clean1.isEmpty() && clean1.equals(clean2);
    }

    private String cleanImageData(String data) {
        if (data == null) return "";
        int commaIdx = data.indexOf(",");
        if (commaIdx != -1) {
            data = data.substring(commaIdx + 1);
        }
        return data.replaceAll("\\s+", "");
    }
}
