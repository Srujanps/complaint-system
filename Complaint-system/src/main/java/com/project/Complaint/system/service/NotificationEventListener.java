package com.project.Complaint.system.service;

import com.project.Complaint.system.event.*;
import com.project.Complaint.system.model.*;
import com.project.Complaint.system.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class NotificationEventListener {

    private static final Logger logger = LoggerFactory.getLogger(NotificationEventListener.class);

    @Autowired
    private EmailNotificationService emailNotificationService;

    @Autowired
    private EmailTemplateService emailTemplateService;

    @Autowired
    private TranslationService translationService;

    @Autowired
    private UserNotificationPreferencesRepository preferencesRepository;

    @Autowired
    private EmailActionTokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMMM yyyy, hh:mm a");

    @Async
    @EventListener
    public void handleUserRegistered(UserRegisteredEvent event) {
        User user = event.getUser();
        String lang = user.getPreferredLanguage() != null ? user.getPreferredLanguage() : "EN";

        if (!user.getIsEmailVerified() && user.getEmailVerificationToken() != null) {
            EmailTemplate template = emailTemplateService.getTemplate("VERIFY_EMAIL", lang);
            String verificationUrl = "http://localhost:8080/verify_email.html?token=" + user.getEmailVerificationToken();
            
            Map<String, String> vars = new HashMap<>();
            vars.put("CITIZEN_NAME", user.getFullName() != null ? user.getFullName() : user.getUsername());
            vars.put("VERIFICATION_LINK", verificationUrl);

            String subject = translationService.translate("VERIFY_SUBJECT", lang);
            String html = emailTemplateService.interpolate(template.getBodyTemplateHtml(), vars);
            String text = emailTemplateService.interpolate(template.getBodyTemplateText(), vars);

            emailNotificationService.sendEmail(user, user.getEmail(), null, null, "VERIFY_EMAIL", subject, html, text, lang);
        }

        if (user.getIsEmailVerified() || event.isFirstLogin()) {
            sendWelcomeEmail(user);
        }
    }

    private void sendWelcomeEmail(User user) {
        String lang = user.getPreferredLanguage() != null ? user.getPreferredLanguage() : "EN";
        EmailTemplate template = emailTemplateService.getTemplate("WELCOME", lang);

        Map<String, String> vars = new HashMap<>();
        vars.put("CITIZEN_NAME", user.getFullName() != null ? user.getFullName() : user.getUsername());
        vars.put("CITIZEN_EMAIL", user.getEmail());
        vars.put("DASHBOARD_LINK", "http://localhost:8080/citizen/my_complaints.html");

        String subject = translationService.translate("WELCOME_SUBJECT", lang);
        String html = emailTemplateService.interpolate(template.getBodyTemplateHtml(), vars);
        String text = emailTemplateService.interpolate(template.getBodyTemplateText(), vars);

        emailNotificationService.sendEmail(user, user.getEmail(), null, null, "WELCOME", subject, html, text, lang);
    }

    @Async
    @EventListener
    public void handleComplaintCreated(ComplaintCreatedEvent event) {
        Complaint complaint = event.getComplaint();
        User citizen = complaint.getCitizen();
        if (citizen == null) return;

        UserNotificationPreferences prefs = getOrCreatePreferences(citizen);
        if (!prefs.getSubmissionConfirmation()) return;

        String lang = citizen.getPreferredLanguage() != null ? citizen.getPreferredLanguage() : "EN";
        EmailTemplate template = emailTemplateService.getTemplate("COMPLAINT_REGISTERED", lang);

        String ref = complaint.getComplaintRef() != null ? complaint.getComplaintRef() : "GRV-2026-" + String.format("%06d", complaint.getComplaintId());
        String statusStr = translationService.translateStatus(complaint.getStatus(), lang);

        Map<String, String> vars = new HashMap<>();
        vars.put("CITIZEN_NAME", citizen.getFullName() != null ? citizen.getFullName() : citizen.getUsername());
        vars.put("COMPLAINT_REF", ref);
        vars.put("CATEGORY_NAME", complaint.getCategory() != null ? complaint.getCategory().getCategoryName() : "General Civic");
        vars.put("SUBMISSION_DATE", complaint.getCreatedAt() != null ? complaint.getCreatedAt().format(DATE_FORMATTER) : LocalDateTime.now().format(DATE_FORMATTER));
        vars.put("LOCATION", complaint.getLocation() != null ? complaint.getLocation() : "General Jurisdiction");
        vars.put("CURRENT_STATUS", statusStr);
        vars.put("PRIORITY", complaint.getPriority() != null ? complaint.getPriority().name() : "MEDIUM");
        vars.put("SLA_DATE", complaint.getSlaDeadline() != null ? complaint.getSlaDeadline().format(DATE_FORMATTER) : "48 Hours Target");
        vars.put("TRACK_LINK", "http://localhost:8080/citizen/my_complaints.html?ref=" + ref);

        String subject = translationService.translate("REGISTERED_SUBJECT", lang) + ref;
        String html = emailTemplateService.interpolate(template.getBodyTemplateHtml(), vars);
        String text = emailTemplateService.interpolate(template.getBodyTemplateText(), vars);

        emailNotificationService.sendEmail(citizen, citizen.getEmail(), ref, complaint.getComplaintId(), "COMPLAINT_REGISTERED", subject, html, text, lang);

        // Notify officers of new high/critical complaint
        if (complaint.getPriority() == Priority.HIGH || complaint.getPriority() == Priority.CRITICAL) {
            notifyOfficersNewComplaint(complaint, ref);
        }
    }

    private void notifyOfficersNewComplaint(Complaint complaint, String ref) {
        List<User> officers = userRepository.findByRole(Role.OFFICER);
        for (User officer : officers) {
            emailNotificationService.sendEmail(officer, officer.getEmail(), ref, complaint.getComplaintId(),
                    "OFFICER_ALERT", "⚠ High Priority Complaint Submitted – " + ref,
                    "<p>A new " + complaint.getPriority() + " priority complaint has been submitted: " + complaint.getTitle() + "</p>",
                    "New High Priority Complaint: " + ref, "EN");
        }
    }

    @Async
    @EventListener
    public void handleComplaintStatusChanged(ComplaintStatusChangedEvent event) {
        Complaint complaint = event.getComplaint();
        User citizen = complaint.getCitizen();
        if (citizen == null) return;

        UserNotificationPreferences prefs = getOrCreatePreferences(citizen);
        if (!prefs.getStatusUpdates()) return;

        String lang = citizen.getPreferredLanguage() != null ? citizen.getPreferredLanguage() : "EN";
        String ref = complaint.getComplaintRef() != null ? complaint.getComplaintRef() : "GRV-2026-" + String.format("%06d", complaint.getComplaintId());

        if (event.getNewStatus() == ComplaintStatus.RESOLVED) {
            sendResolutionEmail(complaint, citizen, ref, lang);
            return;
        }

        EmailTemplate template = emailTemplateService.getTemplate("STATUS_UPDATE", lang);
        String prevStatusTranslated = translationService.translateStatus(event.getOldStatus(), lang);
        String newStatusTranslated = translationService.translateStatus(event.getNewStatus(), lang);

        Map<String, String> vars = new HashMap<>();
        vars.put("CITIZEN_NAME", citizen.getFullName() != null ? citizen.getFullName() : citizen.getUsername());
        vars.put("COMPLAINT_REF", ref);
        vars.put("COMPLAINT_TITLE", complaint.getTitle());
        vars.put("PREVIOUS_STATUS", prevStatusTranslated);
        vars.put("CURRENT_STATUS", newStatusTranslated);
        vars.put("OFFICIAL_NOTE", event.getOfficialNote() != null ? event.getOfficialNote() : "Status updated by designated authority.");
        vars.put("UPDATED_AT", LocalDateTime.now().format(DATE_FORMATTER));
        vars.put("TRACK_LINK", "http://localhost:8080/citizen/my_complaints.html?ref=" + ref);

        String subject = translationService.translate("STATUS_UPDATE_SUBJECT", lang) + ref;
        String html = emailTemplateService.interpolate(template.getBodyTemplateHtml(), vars);
        String text = emailTemplateService.interpolate(template.getBodyTemplateText(), vars);

        emailNotificationService.sendEmail(citizen, citizen.getEmail(), ref, complaint.getComplaintId(), "STATUS_UPDATE", subject, html, text, lang);
    }

    private void sendResolutionEmail(Complaint complaint, User citizen, String ref, String lang) {
        EmailTemplate template = emailTemplateService.getTemplate("RESOLVED", lang);

        // Generate action tokens for feedback links
        String solvedToken = createActionToken(citizen, complaint, "PROBLEM_SOLVED");
        String notSolvedToken = createActionToken(citizen, complaint, "PROBLEM_NOT_SOLVED");

        String viewLink = "http://localhost:8080/citizen/my_complaints.html?ref=" + ref + "&view=resolution";
        String solvedLink = "http://localhost:8080/citizen/my_complaints.html?action=solved&token=" + solvedToken;
        String notSolvedLink = "http://localhost:8080/citizen/my_complaints.html?action=not_solved&token=" + notSolvedToken;

        Map<String, String> vars = new HashMap<>();
        vars.put("CITIZEN_NAME", citizen.getFullName() != null ? citizen.getFullName() : citizen.getUsername());
        vars.put("COMPLAINT_REF", ref);
        vars.put("CATEGORY_NAME", complaint.getCategory() != null ? complaint.getCategory().getCategoryName() : "Civic Issue");
        vars.put("RESOLUTION_DATE", LocalDateTime.now().format(DATE_FORMATTER));
        vars.put("RESOLUTION_NOTE", complaint.getResolutionNote() != null ? complaint.getResolutionNote() : "Work completed and verified by designated officer.");
        vars.put("VIEW_LINK", viewLink);
        vars.put("SOLVED_LINK", solvedLink);
        vars.put("NOT_SOLVED_LINK", notSolvedLink);

        String subject = translationService.translate("RESOLVED_SUBJECT", lang) + ref;
        String html = emailTemplateService.interpolate(template.getBodyTemplateHtml(), vars);
        String text = emailTemplateService.interpolate(template.getBodyTemplateText(), vars);

        emailNotificationService.sendEmail(citizen, citizen.getEmail(), ref, complaint.getComplaintId(), "RESOLUTION", subject, html, text, lang);
    }

    private String createActionToken(User user, Complaint complaint, String actionType) {
        EmailActionToken actionToken = new EmailActionToken();
        actionToken.setToken(UUID.randomUUID().toString());
        actionToken.setUser(user);
        actionToken.setComplaint(complaint);
        actionToken.setActionType(actionType);
        actionToken.setExpiryDate(LocalDateTime.now().plusDays(7));
        actionToken.setUsed(false);
        tokenRepository.save(actionToken);
        return actionToken.getToken();
    }

    @Async
    @EventListener
    public void handleSLANotification(SLANotificationEvent event) {
        Complaint complaint = event.getComplaint();
        User citizen = complaint.getCitizen();
        if (citizen == null) return;

        UserNotificationPreferences prefs = getOrCreatePreferences(citizen);
        if (!prefs.getSlaNotifications()) return;

        String lang = citizen.getPreferredLanguage() != null ? citizen.getPreferredLanguage() : "EN";
        String ref = complaint.getComplaintRef() != null ? complaint.getComplaintRef() : "GRV-2026-" + String.format("%06d", complaint.getComplaintId());

        if (event.getSlaType() == SLANotificationEvent.SLAType.WARNING) {
            EmailTemplate template = emailTemplateService.getTemplate("SLA_WARNING", lang);
            Map<String, String> vars = new HashMap<>();
            vars.put("CITIZEN_NAME", citizen.getFullName() != null ? citizen.getFullName() : citizen.getUsername());
            vars.put("COMPLAINT_REF", ref);
            vars.put("CURRENT_STATUS", translationService.translateStatus(complaint.getStatus(), lang));
            vars.put("EXPECTED_SLA_DATE", complaint.getSlaDeadline() != null ? complaint.getSlaDeadline().format(DATE_FORMATTER) : "Approaching");
            vars.put("REMAINING_TIME", (event.getRemainingMinutes() / 60) + " hours " + (event.getRemainingMinutes() % 60) + " mins");
            vars.put("ASSIGNED_DEPARTMENT", complaint.getCategory() != null ? complaint.getCategory().getCategoryName() : "Public Services");
            vars.put("TRACK_LINK", "http://localhost:8080/citizen/my_complaints.html?ref=" + ref);

            String subject = translationService.translate("SLA_WARNING_SUBJECT", lang) + ref;
            String html = emailTemplateService.interpolate(template.getBodyTemplateHtml(), vars);
            String text = emailTemplateService.interpolate(template.getBodyTemplateText(), vars);

            emailNotificationService.sendEmail(citizen, citizen.getEmail(), ref, complaint.getComplaintId(), "SLA_WARNING", subject, html, text, lang);
        } else if (event.getSlaType() == SLANotificationEvent.SLAType.BREACH) {
            EmailTemplate template = emailTemplateService.getTemplate("SLA_BREACH", lang);
            Map<String, String> vars = new HashMap<>();
            vars.put("CITIZEN_NAME", citizen.getFullName() != null ? citizen.getFullName() : citizen.getUsername());
            vars.put("COMPLAINT_REF", ref);
            vars.put("EXPECTED_SLA_DATE", complaint.getSlaDeadline() != null ? complaint.getSlaDeadline().format(DATE_FORMATTER) : "Expired");
            vars.put("DELAY_DURATION", Math.abs(event.getRemainingMinutes() / 60) + " hours overdue");
            vars.put("TRACK_LINK", "http://localhost:8080/citizen/my_complaints.html?ref=" + ref);

            String subject = translationService.translate("SLA_BREACH_SUBJECT", lang) + ref;
            String html = emailTemplateService.interpolate(template.getBodyTemplateHtml(), vars);
            String text = emailTemplateService.interpolate(template.getBodyTemplateText(), vars);

            emailNotificationService.sendEmail(citizen, citizen.getEmail(), ref, complaint.getComplaintId(), "SLA_BREACH", subject, html, text, lang);
        }
    }

    @Async
    @EventListener
    public void handleComplaintReopened(ComplaintReopenedEvent event) {
        Complaint complaint = event.getComplaint();
        User citizen = complaint.getCitizen();
        String ref = complaint.getComplaintRef() != null ? complaint.getComplaintRef() : "GRV-2026-" + String.format("%06d", complaint.getComplaintId());

        if (citizen != null) {
            emailNotificationService.sendEmail(citizen, citizen.getEmail(), ref, complaint.getComplaintId(),
                    "REOPENED", "Reopening Request Recorded – " + ref,
                    "<p>Your reopening request for complaint <strong>" + ref + "</strong> has been recorded and submitted to officers. Reason: " + event.getReason() + "</p>",
                    "Reopening Request Recorded for " + ref, citizen.getPreferredLanguage());
        }

        // Notify officers
        List<User> officers = userRepository.findByRole(Role.OFFICER);
        for (User officer : officers) {
            emailNotificationService.sendEmail(officer, officer.getEmail(), ref, complaint.getComplaintId(),
                    "OFFICER_REOPEN_ALERT", "⚠ Complaint Reopened by Citizen – " + ref,
                    "<p>Citizen has reopened complaint <strong>" + ref + "</strong>. Reason: " + event.getReason() + "</p>",
                    "Complaint Reopened: " + ref, "EN");
        }
    }

    @Async
    @EventListener
    public void handleDuplicateDetected(DuplicateDetectedEvent event) {
        Complaint newComplaint = event.getNewComplaint();
        Complaint existing = event.getExistingComplaint();
        User citizen = newComplaint.getCitizen();
        if (citizen == null) return;

        String lang = citizen.getPreferredLanguage() != null ? citizen.getPreferredLanguage() : "EN";
        String newRef = newComplaint.getComplaintRef() != null ? newComplaint.getComplaintRef() : "GRV-2026-" + String.format("%06d", newComplaint.getComplaintId());
        String existingRef = existing.getComplaintRef() != null ? existing.getComplaintRef() : "GRV-2026-" + String.format("%06d", existing.getComplaintId());

        EmailTemplate template = emailTemplateService.getTemplate("DUPLICATE_ALERT", lang);
        Map<String, String> vars = new HashMap<>();
        vars.put("CITIZEN_NAME", citizen.getFullName() != null ? citizen.getFullName() : citizen.getUsername());
        vars.put("COMPLAINT_REF", newRef);
        vars.put("EXISTING_COMPLAINT_REF", existingRef);
        vars.put("EXISTING_STATUS", translationService.translateStatus(existing.getStatus(), lang));
        vars.put("SIMILARITY_SCORE", String.format("%.0f", event.getSimilarityScore() * 100));
        vars.put("TRACK_LINK", "http://localhost:8080/citizen/my_complaints.html?ref=" + newRef);

        String subject = translationService.translate("DUPLICATE_SUBJECT", lang) + newRef;
        String html = emailTemplateService.interpolate(template.getBodyTemplateHtml(), vars);
        String text = emailTemplateService.interpolate(template.getBodyTemplateText(), vars);

        emailNotificationService.sendEmail(citizen, citizen.getEmail(), newRef, newComplaint.getComplaintId(), "DUPLICATE_ALERT", subject, html, text, lang);
    }

    private UserNotificationPreferences getOrCreatePreferences(User user) {
        return preferencesRepository.findByUser(user)
                .orElseGet(() -> {
                    UserNotificationPreferences newPref = new UserNotificationPreferences();
                    newPref.setUser(user);
                    return preferencesRepository.save(newPref);
                });
    }
}
