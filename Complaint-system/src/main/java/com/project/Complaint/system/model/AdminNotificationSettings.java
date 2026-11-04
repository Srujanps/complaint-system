package com.project.Complaint.system.model;

import jakarta.persistence.*;

@Entity
@Table(name = "admin_notification_settings")
public class AdminNotificationSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Boolean notifySpike = true;

    @Column(nullable = false)
    private Boolean notifyAiFailure = true;

    @Column(nullable = false)
    private Boolean notifyTranslationFailure = true;

    @Column(nullable = false)
    private Boolean notifyEmailFailure = true;

    @Column(nullable = false)
    private Boolean notifySlaBreachRate = true;

    @Column(nullable = false)
    private Boolean notifyDuplicateCluster = true;

    @Column(nullable = false)
    private Boolean notifyGeographicConcentration = true;

    public AdminNotificationSettings() {}

    public AdminNotificationSettings(Long id, Boolean notifySpike, Boolean notifyAiFailure, Boolean notifyTranslationFailure, Boolean notifyEmailFailure, Boolean notifySlaBreachRate, Boolean notifyDuplicateCluster, Boolean notifyGeographicConcentration) {
        this.id = id;
        this.notifySpike = notifySpike;
        this.notifyAiFailure = notifyAiFailure;
        this.notifyTranslationFailure = notifyTranslationFailure;
        this.notifyEmailFailure = notifyEmailFailure;
        this.notifySlaBreachRate = notifySlaBreachRate;
        this.notifyDuplicateCluster = notifyDuplicateCluster;
        this.notifyGeographicConcentration = notifyGeographicConcentration;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Boolean getNotifySpike() { return notifySpike; }
    public void setNotifySpike(Boolean notifySpike) { this.notifySpike = notifySpike; }

    public Boolean getNotifyAiFailure() { return notifyAiFailure; }
    public void setNotifyAiFailure(Boolean notifyAiFailure) { this.notifyAiFailure = notifyAiFailure; }

    public Boolean getNotifyTranslationFailure() { return notifyTranslationFailure; }
    public void setNotifyTranslationFailure(Boolean notifyTranslationFailure) { this.notifyTranslationFailure = notifyTranslationFailure; }

    public Boolean getNotifyEmailFailure() { return notifyEmailFailure; }
    public void setNotifyEmailFailure(Boolean notifyEmailFailure) { this.notifyEmailFailure = notifyEmailFailure; }

    public Boolean getNotifySlaBreachRate() { return notifySlaBreachRate; }
    public void setNotifySlaBreachRate(Boolean notifySlaBreachRate) { this.notifySlaBreachRate = notifySlaBreachRate; }

    public Boolean getNotifyDuplicateCluster() { return notifyDuplicateCluster; }
    public void setNotifyDuplicateCluster(Boolean notifyDuplicateCluster) { this.notifyDuplicateCluster = notifyDuplicateCluster; }

    public Boolean getNotifyGeographicConcentration() { return notifyGeographicConcentration; }
    public void setNotifyGeographicConcentration(Boolean notifyGeographicConcentration) { this.notifyGeographicConcentration = notifyGeographicConcentration; }
}
