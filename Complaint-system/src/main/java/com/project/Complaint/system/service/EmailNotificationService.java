package com.project.Complaint.system.service;

import com.project.Complaint.system.model.NotificationLog;
import com.project.Complaint.system.model.User;
import com.project.Complaint.system.repository.NotificationLogRepository;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class EmailNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Value("${spring.mail.username:noreply@civicportal.gov.in}")
    private String fromEmail;

    @Async
    public void sendEmail(User recipient, String recipientEmail, String complaintRef, Long complaintId,
                          String notificationType, String subject, String bodyHtml, String bodyText, String language) {
        
        NotificationLog log = new NotificationLog();
        log.setRecipient(recipient);
        log.setRecipientEmail(recipientEmail != null ? recipientEmail : (recipient != null ? recipient.getEmail() : "unknown"));
        log.setComplaintRef(complaintRef);
        log.setComplaintId(complaintId);
        log.setNotificationType(notificationType);
        log.setSubject(subject);
        log.setLanguage(language != null ? language : "EN");
        log.setSentAt(LocalDateTime.now());

        try {
            if (mailSender != null && !log.getRecipientEmail().endsWith("@example.com")) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromEmail, "AI Grievance Management Portal");
                helper.setTo(log.getRecipientEmail());
                helper.setSubject(subject);
                helper.setText(bodyHtml != null ? bodyHtml : bodyText, true);

                mailSender.send(message);
                log.setStatus("DELIVERED");
                logger.info("📧 EMAIL SENT SUCCESSFULLY to {} for notificationType {}", log.getRecipientEmail(), notificationType);
            } else {
                // Fallback to console logger mode for testing/dev environments
                log.setStatus("DELIVERED");
                logger.info("\n========== [MOCK EMAIL DELIVERED] ==========\nTO: {}\nSUBJECT: {}\nTYPE: {}\nCOMPLAINT: {}\nBODY:\n{}\n==============================================",
                        log.getRecipientEmail(), subject, notificationType, complaintRef, bodyText != null ? bodyText : bodyHtml);
            }
        } catch (Exception e) {
            logger.error("❌ Failed to send email to {}: {}", log.getRecipientEmail(), e.getMessage());
            log.setStatus("FAILED");
            log.setFailureReason(e.getMessage());
            log.setRetryCount(1);
        }

        notificationLogRepository.save(log);
    }

    public boolean retryNotification(Long logId) {
        NotificationLog log = notificationLogRepository.findById(logId)
                .orElseThrow(() -> new RuntimeException("Notification log not found"));
        
        log.setRetryCount(log.getRetryCount() + 1);
        try {
            if (mailSender != null) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromEmail, "AI Grievance Management Portal");
                helper.setTo(log.getRecipientEmail());
                helper.setSubject(log.getSubject() + " (Retry #" + log.getRetryCount() + ")");
                helper.setText("Retry delivery for notification type: " + log.getNotificationType(), true);
                mailSender.send(message);
            }
            log.setStatus("DELIVERED");
            log.setFailureReason(null);
            notificationLogRepository.save(log);
            return true;
        } catch (Exception e) {
            log.setStatus("FAILED");
            log.setFailureReason(e.getMessage());
            notificationLogRepository.save(log);
            return false;
        }
    }
}
