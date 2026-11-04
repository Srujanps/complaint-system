package com.project.Complaint.system.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_logs")
public class NotificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id")
    private User recipient;

    @Column(nullable = false)
    private String recipientEmail;

    private String complaintRef;
    private Long complaintId;

    @Column(nullable = false, length = 50)
    private String notificationType;

    @Column(nullable = false, length = 255)
    private String subject;

    @Column(length = 20, nullable = false)
    private String status = "SENT";

    @Column(columnDefinition = "TEXT")
    private String failureReason;

    private Integer retryCount = 0;

    @Column(length = 10)
    private String language = "EN";

    @CreationTimestamp
    private LocalDateTime sentAt;

    public NotificationLog() {}

    public NotificationLog(Long id, User recipient, String recipientEmail, String complaintRef, Long complaintId, String notificationType, String subject, String status, String failureReason, Integer retryCount, String language, LocalDateTime sentAt) {
        this.id = id;
        this.recipient = recipient;
        this.recipientEmail = recipientEmail;
        this.complaintRef = complaintRef;
        this.complaintId = complaintId;
        this.notificationType = notificationType;
        this.subject = subject;
        this.status = status;
        this.failureReason = failureReason;
        this.retryCount = retryCount;
        this.language = language;
        this.sentAt = sentAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getRecipient() { return recipient; }
    public void setRecipient(User recipient) { this.recipient = recipient; }

    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }

    public String getComplaintRef() { return complaintRef; }
    public void setComplaintRef(String complaintRef) { this.complaintRef = complaintRef; }

    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }

    public String getNotificationType() { return notificationType; }
    public void setNotificationType(String notificationType) { this.notificationType = notificationType; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

    public Integer getRetryCount() { return retryCount; }
    public void setRetryCount(Integer retryCount) { this.retryCount = retryCount; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
}
