package com.project.Complaint.system.controller;

import com.project.Complaint.system.model.*;
import com.project.Complaint.system.repository.*;
import com.project.Complaint.system.service.AuthService;
import com.project.Complaint.system.service.ComplaintService;
import com.project.Complaint.system.service.EmailNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Autowired
    private UserNotificationPreferencesRepository preferencesRepository;

    @Autowired
    private AdminNotificationSettingsRepository adminSettingsRepository;

    @Autowired
    private EmailActionTokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailNotificationService emailNotificationService;

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private AuthService authService;

    // GET /api/notifications/my - Citizen Notification History
    @GetMapping("/api/notifications/my")
    public ResponseEntity<?> getMyNotifications() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User user = userRepository.findByUsername(auth.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<NotificationLog> logs = notificationLogRepository.findByRecipientOrderBySentAtDesc(user);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/notifications/preferences - Citizen Notification Preferences
    @GetMapping("/api/notifications/preferences")
    public ResponseEntity<?> getMyPreferences() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User user = userRepository.findByUsername(auth.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            UserNotificationPreferences prefs = preferencesRepository.findByUser(user)
                    .orElseGet(() -> {
                        UserNotificationPreferences p = new UserNotificationPreferences();
                        p.setUser(user);
                        return preferencesRepository.save(p);
                    });

            return ResponseEntity.ok(prefs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /api/notifications/preferences - Update Citizen Notification Preferences
    @PutMapping("/api/notifications/preferences")
    public ResponseEntity<?> updateMyPreferences(@RequestBody UserNotificationPreferences updated) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User user = userRepository.findByUsername(auth.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            UserNotificationPreferences prefs = preferencesRepository.findByUser(user)
                    .orElseGet(() -> {
                        UserNotificationPreferences p = new UserNotificationPreferences();
                        p.setUser(user);
                        return p;
                    });

            prefs.setStatusUpdates(updated.getStatusUpdates());
            prefs.setSubmissionConfirmation(updated.getSubmissionConfirmation());
            prefs.setResolutionNotification(updated.getResolutionNotification());
            prefs.setSlaNotifications(updated.getSlaNotifications());
            prefs.setReopeningUpdates(updated.getReopeningUpdates());
            prefs.setPublicAnnouncements(updated.getPublicAnnouncements());
            prefs.setPromotionalEmails(updated.getPromotionalEmails());

            UserNotificationPreferences saved = preferencesRepository.save(prefs);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/admin/notifications/logs - Admin Email Logs
    @GetMapping("/api/admin/notifications/logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminLogs(@RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<NotificationLog> logs = notificationLogRepository.findAllByOrderBySentAtDesc(pageable);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // POST /api/admin/notifications/logs/{id}/retry - Manual Retry Sending Failed Email
    @PostMapping("/api/admin/notifications/logs/{id}/retry")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> retryNotification(@PathVariable Long id) {
        try {
            boolean success = emailNotificationService.retryNotification(id);
            if (success) {
                return ResponseEntity.ok(Map.of("message", "Email re-sent successfully"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Email retry failed"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/admin/notifications/settings - Get Admin Alert Settings
    @GetMapping("/api/admin/notifications/settings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminSettings() {
        try {
            AdminNotificationSettings settings = adminSettingsRepository.findAll().stream().findFirst()
                    .orElseGet(() -> adminSettingsRepository.save(new AdminNotificationSettings()));
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /api/admin/notifications/settings - Update Admin Alert Settings
    @PutMapping("/api/admin/notifications/settings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateAdminSettings(@RequestBody AdminNotificationSettings settings) {
        try {
            AdminNotificationSettings existing = adminSettingsRepository.findAll().stream().findFirst()
                    .orElseGet(AdminNotificationSettings::new);

            existing.setNotifySpike(settings.getNotifySpike());
            existing.setNotifyAiFailure(settings.getNotifyAiFailure());
            existing.setNotifyTranslationFailure(settings.getNotifyTranslationFailure());
            existing.setNotifyEmailFailure(settings.getNotifyEmailFailure());
            existing.setNotifySlaBreachRate(settings.getNotifySlaBreachRate());
            existing.setNotifyDuplicateCluster(settings.getNotifyDuplicateCluster());
            existing.setNotifyGeographicConcentration(settings.getNotifyGeographicConcentration());

            AdminNotificationSettings saved = adminSettingsRepository.save(existing);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /api/auth/action-token - Validate email action token (public)
    @GetMapping("/api/auth/action-token")
    public ResponseEntity<?> validateActionToken(@RequestParam String token) {
        try {
            EmailActionToken actionToken = tokenRepository.findByToken(token)
                    .orElseThrow(() -> new RuntimeException("Invalid or expired action link"));

            if (Boolean.TRUE.equals(actionToken.getUsed())) {
                return ResponseEntity.ok(Map.of("valid", true, "used", true, "actionType", actionToken.getActionType()));
            }

            Map<String, Object> resp = new HashMap<>();
            resp.put("valid", true);
            resp.put("used", false);
            resp.put("actionType", actionToken.getActionType());

            if (actionToken.getComplaint() != null) {
                resp.put("complaintId", actionToken.getComplaint().getComplaintId());
                resp.put("complaintRef", actionToken.getComplaint().getComplaintRef() != null ?
                        actionToken.getComplaint().getComplaintRef() : "GRV-2026-" + String.format("%06d", actionToken.getComplaint().getComplaintId()));
                resp.put("title", actionToken.getComplaint().getTitle());
            }

            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "message", e.getMessage()));
        }
    }
}
