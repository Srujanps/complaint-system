package com.project.Complaint.system.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_notification_preferences")
public class UserNotificationPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private Boolean statusUpdates = true;

    @Column(nullable = false)
    private Boolean submissionConfirmation = true;

    @Column(nullable = false)
    private Boolean resolutionNotification = true;

    @Column(nullable = false)
    private Boolean slaNotifications = true;

    @Column(nullable = false)
    private Boolean reopeningUpdates = true;

    @Column(nullable = false)
    private Boolean publicAnnouncements = true;

    @Column(nullable = false)
    private Boolean promotionalEmails = false;

    public UserNotificationPreferences() {}

    public UserNotificationPreferences(Long id, User user, Boolean statusUpdates, Boolean submissionConfirmation, Boolean resolutionNotification, Boolean slaNotifications, Boolean reopeningUpdates, Boolean publicAnnouncements, Boolean promotionalEmails) {
        this.id = id;
        this.user = user;
        this.statusUpdates = statusUpdates;
        this.submissionConfirmation = submissionConfirmation;
        this.resolutionNotification = resolutionNotification;
        this.slaNotifications = slaNotifications;
        this.reopeningUpdates = reopeningUpdates;
        this.publicAnnouncements = publicAnnouncements;
        this.promotionalEmails = promotionalEmails;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Boolean getStatusUpdates() { return statusUpdates; }
    public void setStatusUpdates(Boolean statusUpdates) { this.statusUpdates = statusUpdates; }

    public Boolean getSubmissionConfirmation() { return submissionConfirmation; }
    public void setSubmissionConfirmation(Boolean submissionConfirmation) { this.submissionConfirmation = submissionConfirmation; }

    public Boolean getResolutionNotification() { return resolutionNotification; }
    public void setResolutionNotification(Boolean resolutionNotification) { this.resolutionNotification = resolutionNotification; }

    public Boolean getSlaNotifications() { return slaNotifications; }
    public void setSlaNotifications(Boolean slaNotifications) { this.slaNotifications = slaNotifications; }

    public Boolean getReopeningUpdates() { return reopeningUpdates; }
    public void setReopeningUpdates(Boolean reopeningUpdates) { this.reopeningUpdates = reopeningUpdates; }

    public Boolean getPublicAnnouncements() { return publicAnnouncements; }
    public void setPublicAnnouncements(Boolean publicAnnouncements) { this.publicAnnouncements = publicAnnouncements; }

    public Boolean getPromotionalEmails() { return promotionalEmails; }
    public void setPromotionalEmails(Boolean promotionalEmails) { this.promotionalEmails = promotionalEmails; }
}
