package com.project.Complaint.system.service;

import com.project.Complaint.system.model.*;
import com.project.Complaint.system.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Retrieval-Augmented Generation (RAG) Retriever Service
 * Fetches scoped live database records, ticket details, and municipal policies
 * to ground AI responses in verifiable facts without hallucination.
 */
@Service
public class CivicRagRetrieverService {

    private static final Logger log = LoggerFactory.getLogger(CivicRagRetrieverService.class);

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    public String retrieveContextForUser(User user, String roleStr, String query) {
        StringBuilder sb = new StringBuilder();

        // 1. Core Municipal SOPs & Policy Knowledge
        sb.append("=== MUNICIPAL OPERATIONAL POLICIES & SOPS ===\n");
        sb.append("- 24x7 Emergency Public Safety Helpline: 1800-11-2233\n");
        sb.append("- SLA Deadlines: CRITICAL=12 hours, HIGH=24 hours, MEDIUM=48 hours, LOW=72 hours\n");
        sb.append("- Valid Statuses: RECEIVED, VERIFIED, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED, FLAGGED_DUPLICATE, REOPENED\n");
        sb.append("- Closed/Resolved complaints can be reopened by citizens within 7 days if unsatisfactory.\n\n");

        // 2. Specific Ticket Reference Extraction (e.g. GRV-2026-000012, #12, or standalone ticket ID)
        extractAndAppendSpecificTicket(query, sb);

        // 3. User Scoped Retrieval
        if (user == null) {
            String role = (roleStr != null && !roleStr.isBlank()) ? roleStr.toUpperCase() : "GUEST";
            sb.append("=== USER SESSION ===\n");
            sb.append("User Status: Unauthenticated/Guest (Role: ").append(role).append(")\n");
            sb.append("Available Categories in System: ");
            List<Category> categories = categoryRepository.findAll();
            for (Category c : categories) {
                sb.append(c.getName()).append(", ");
            }
            sb.append("\nGuidance: Guide the user on registering, logging in, filing grievances, or contacting the 24x7 emergency helpline.\n\n");
            return sb.toString();
        }

        Role userRole = user.getRole();
        sb.append("=== AUTHENTICATED USER CONTEXT ===\n");
        sb.append("Name: ").append(user.getFullName() != null ? user.getFullName() : user.getUsername())
          .append(" | Email: ").append(user.getEmail())
          .append(" | Role: ").append(userRole.name());
        if (user.getConstituency() != null && !user.getConstituency().isBlank()) {
            sb.append(" | Area/Constituency: ").append(user.getConstituency());
        }
        sb.append("\n\n");

        switch (userRole) {
            case CITIZEN -> appendCitizenContext(user, sb);
            case OFFICER -> appendOfficerContext(sb);
            case VENDOR -> appendVendorContext(user, sb);
            case REPRESENTATIVE -> appendRepresentativeContext(user, sb);
            case ADMIN -> appendAdminContext(sb);
        }

        return sb.toString();
    }

    private void appendCitizenContext(User citizen, StringBuilder sb) {
        List<Complaint> myComplaints = complaintRepository.findByCitizen(citizen);
        sb.append("=== CITIZEN'S RECENT COMPLAINTS (Total: ").append(myComplaints.size()).append(") ===\n");

        if (myComplaints.isEmpty()) {
            sb.append("No complaints filed yet by this citizen. Guide them to click 'Log a New Complaint'.\n\n");
            return;
        }

        // Show the top 5 most recent complaints
        myComplaints.stream()
                .sorted((a, b) -> Long.compare(b.getComplaintId(), a.getComplaintId()))
                .limit(5)
                .forEach(c -> sb.append(formatComplaintSummary(c)).append("\n"));
        sb.append("\n");
    }

    private void appendOfficerContext(StringBuilder sb) {
        List<Complaint> openComplaints = complaintRepository.findByStatusNotIn(
                List.of(ComplaintStatus.CLOSED, ComplaintStatus.RESOLVED, ComplaintStatus.FLAGGED_DUPLICATE)
        );

        long duplicateCount = complaintRepository.countByStatus(ComplaintStatus.FLAGGED_DUPLICATE);
        List<User> vendors = userRepository.findByRole(Role.VENDOR);

        sb.append("=== WARD OFFICER QUEUE OVERVIEW ===\n");
        sb.append("Total Open Active Complaints: ").append(openComplaints.size()).append("\n");
        sb.append("Flagged Duplicate Complaints Pending Officer Review: ").append(duplicateCount).append("\n");
        sb.append("Total Registered System Vendors: ").append(vendors.size()).append("\n\n");

        sb.append("=== REGISTERED SYSTEM VENDORS & CURRENT WORKLOADS ===\n");
        if (vendors.isEmpty()) {
            sb.append("No vendors registered in the system.\n\n");
        } else {
            for (User v : vendors) {
                long active = assignmentRepository.countByVendorAndStatus(v, AssignmentStatus.ASSIGNED)
                        + assignmentRepository.countByVendorAndStatus(v, AssignmentStatus.IN_PROGRESS);
                long completed = assignmentRepository.countByVendorAndStatus(v, AssignmentStatus.COMPLETED);
                sb.append(String.format("- Vendor #%d: %s (@%s) | Specialty: %s | Active Jobs: %d | Completed: %d | Area: %s\n",
                        v.getUserId(),
                        v.getFullName() != null ? v.getFullName() : v.getUsername(),
                        v.getUsername(),
                        v.getDesignation() != null ? v.getDesignation() : "General Contractor",
                        active,
                        completed,
                        v.getConstituency() != null ? v.getConstituency() : "All Wards"));
            }
            sb.append("\n");
        }

        sb.append("=== URGENT COMPLAINTS REQUIRING ATTENTION (CRITICAL / HIGH) ===\n");
        openComplaints.stream()
                .filter(c -> c.getPriority() == Priority.CRITICAL || c.getPriority() == Priority.HIGH)
                .limit(6)
                .forEach(c -> sb.append(formatComplaintSummary(c)).append("\n"));
        sb.append("\n");
    }

    private void appendVendorContext(User vendor, StringBuilder sb) {
        List<Assignment> tasks = assignmentRepository.findByVendor(vendor);
        sb.append("=== VENDOR ASSIGNED WORK ORDERS (Total: ").append(tasks.size()).append(") ===\n");

        if (tasks.isEmpty()) {
            sb.append("No active work orders assigned to this vendor at present.\n\n");
            return;
        }

        tasks.stream()
                .sorted((a, b) -> Long.compare(b.getAssignmentId(), a.getAssignmentId()))
                .limit(6)
                .forEach(a -> {
                    Complaint c = a.getComplaint();
                    sb.append(String.format("- Task #%d | Status: %s | Ticket #%d (%s) | Category: %s | Location: %s | Due: %s\n",
                            a.getAssignmentId(),
                            a.getStatus(),
                            c.getComplaintId(),
                            c.getTitle(),
                            c.getCategory() != null ? c.getCategory().getName() : "General",
                            c.getLocation() != null ? c.getLocation() : "Site",
                            calculateSlaRemaining(c)));
                });
        sb.append("\n");
    }

    private void appendRepresentativeContext(User rep, StringBuilder sb) {
        String area = rep.getConstituency() != null && !rep.getConstituency().isBlank() ? rep.getConstituency() : "";
        sb.append("=== REPRESENTATIVE CONSTITUENCY METRICS (Area: ").append(area.isEmpty() ? "All Areas" : area).append(") ===\n");

        long total = area.isEmpty() ? complaintRepository.count() : complaintRepository.countByLocationContainingIgnoreCase(area);
        long resolved = area.isEmpty() ? complaintRepository.countByStatus(ComplaintStatus.RESOLVED) :
                complaintRepository.countByLocationContainingIgnoreCaseAndStatus(area, ComplaintStatus.RESOLVED);
        long pending = total - resolved;

        sb.append("Constituency Total Complaints: ").append(total)
          .append(" | Resolved: ").append(resolved)
          .append(" | Pending/Active: ").append(pending).append("\n\n");

        sb.append("=== RECENT AREA COMPLAINTS ===\n");
        if (!area.isEmpty()) {
            var page = complaintRepository.findByLocationContainingIgnoreCase(area, org.springframework.data.domain.PageRequest.of(0, 5));
            page.getContent().forEach(c -> sb.append(formatComplaintSummary(c)).append("\n"));
        } else {
            complaintRepository.findAll(org.springframework.data.domain.PageRequest.of(0, 5))
                    .getContent().forEach(c -> sb.append(formatComplaintSummary(c)).append("\n"));
        }
        sb.append("\n");
    }

    private void appendAdminContext(StringBuilder sb) {
        long total = complaintRepository.count();
        long resolved = complaintRepository.countByStatus(ComplaintStatus.RESOLVED);
        long closed = complaintRepository.countByStatus(ComplaintStatus.CLOSED);
        long open = total - (resolved + closed);
        long usersCount = userRepository.count();

        sb.append("=== EXECUTIVE MUNICIPAL GOVERNANCE DASHBOARD ===\n");
        sb.append("Total Registered Users: ").append(usersCount).append("\n");
        sb.append("Total Grievances Logged: ").append(total).append("\n");
        sb.append("Active Open Grievances: ").append(open).append("\n");
        sb.append("Total Resolved Grievances: ").append(resolved).append("\n");
        sb.append("System Resolution Rate: ").append(total > 0 ? String.format("%.1f%%", (resolved * 100.0 / total)) : "100%").append("\n\n");
    }

    private void extractAndAppendSpecificTicket(String query, StringBuilder sb) {
        if (query == null) return;

        Pattern pattern = Pattern.compile("(?i)(GRV-\\d{4}-\\d+|#(\\d{1,6})|\\b(?:ticket|complaint|grievance|id|track|status|about|for|number|no\\.?)\\s*#?\\s*(\\d{1,6})\\b)");
        Matcher matcher = pattern.matcher(query);

        Optional<Complaint> found = Optional.empty();
        if (matcher.find()) {
            String fullMatch = matcher.group(1);
            String numericId = matcher.group(2) != null ? matcher.group(2) : matcher.group(3);

            if (fullMatch != null && fullMatch.toUpperCase().startsWith("GRV-")) {
                found = complaintRepository.findByComplaintRef(fullMatch.toUpperCase());
            } else if (numericId != null) {
                try {
                    found = complaintRepository.findById(Long.parseLong(numericId));
                } catch (NumberFormatException ignored) {}
            }
        } else if (query.trim().matches("^\\d{1,6}$")) {
            try {
                found = complaintRepository.findById(Long.parseLong(query.trim()));
            } catch (NumberFormatException ignored) {}
        }

        found.ifPresent(c -> {
            sb.append("=== EXPLICITLY REFERENCED TICKET IN USER QUERY ===\n");
            sb.append(formatComplaintDetail(c)).append("\n\n");
        });
    }

    private String formatComplaintSummary(Complaint c) {
        String slaStatus = calculateSlaRemaining(c);
        return String.format("- Ref: %s (ID: #%d) | Title: \"%s\" | Cat: %s | Status: %s | Priority: %s | SLA: %s | Location: %s",
                c.getComplaintRef() != null ? c.getComplaintRef() : "GRV-" + c.getComplaintId(),
                c.getComplaintId(),
                c.getTitle(),
                c.getCategory() != null ? c.getCategory().getName() : "General",
                c.getStatus(),
                c.getPriority() != null ? c.getPriority().name() : "MEDIUM",
                slaStatus,
                c.getLocation() != null ? c.getLocation() : "Not specified");
    }

    private String formatComplaintDetail(Complaint c) {
        StringBuilder b = new StringBuilder();
        b.append("Ticket Ref: ").append(c.getComplaintRef() != null ? c.getComplaintRef() : "GRV-" + c.getComplaintId())
         .append(" (ID: #").append(c.getComplaintId()).append(")\n");
        b.append("Title: ").append(c.getTitle()).append("\n");
        b.append("Category: ").append(c.getCategory() != null ? c.getCategory().getName() : "General").append("\n");
        b.append("Status: ").append(c.getStatus()).append("\n");
        b.append("Priority: ").append(c.getPriority()).append(" (Severity: ").append(c.getSeverityScore() != null ? c.getSeverityScore() : 5).append("/10)\n");
        b.append("Description: ").append(c.getDescription()).append("\n");
        b.append("Location: ").append(c.getLocation()).append("\n");
        b.append("SLA Target: ").append(calculateSlaRemaining(c)).append("\n");

        var assignmentOpt = assignmentRepository.findByComplaint_ComplaintId(c.getComplaintId());
        if (assignmentOpt.isPresent()) {
            Assignment a = assignmentOpt.get();
            User v = a.getVendor();
            b.append("Assigned Vendor: ").append(v.getFullName() != null ? v.getFullName() : v.getUsername())
             .append(" (@").append(v.getUsername()).append(" - ").append(v.getDesignation() != null ? v.getDesignation() : "Contractor")
             .append(") | Task Status: ").append(a.getStatus()).append("\n");
        }

        if (c.getResolutionNote() != null && !c.getResolutionNote().isBlank()) {
            b.append("Resolution/Officer Note: ").append(c.getResolutionNote()).append("\n");
        }
        if (c.getIsDuplicate() != null && c.getIsDuplicate()) {
            b.append("Notice: Flagged duplicate of Ticket #").append(c.getDuplicateOfComplaintId()).append("\n");
        }
        return b.toString();
    }

    private String calculateSlaRemaining(Complaint c) {
        if (c.getStatus() == ComplaintStatus.RESOLVED || c.getStatus() == ComplaintStatus.CLOSED) {
            return "Resolved ✓";
        }
        if (c.getSlaDeadline() == null) {
            return "48h Target";
        }
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(c.getSlaDeadline())) {
            long overdueHours = Duration.between(c.getSlaDeadline(), now).toHours();
            return "OVERDUE by " + overdueHours + " hours (SLA Breached)";
        } else {
            long remainingHours = Duration.between(now, c.getSlaDeadline()).toHours();
            return remainingHours + " hours remaining";
        }
    }
}
