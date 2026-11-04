package com.project.Complaint.system.event;

import com.project.Complaint.system.model.Complaint;
import org.springframework.context.ApplicationEvent;

public class SLANotificationEvent extends ApplicationEvent {
    public enum SLAType { WARNING, BREACH }

    private final Complaint complaint;
    private final SLAType slaType;
    private final long remainingMinutes;

    public SLANotificationEvent(Object source, Complaint complaint, SLAType slaType, long remainingMinutes) {
        super(source);
        this.complaint = complaint;
        this.slaType = slaType;
        this.remainingMinutes = remainingMinutes;
    }

    public Complaint getComplaint() { return complaint; }
    public SLAType getSlaType() { return slaType; }
    public long getRemainingMinutes() { return remainingMinutes; }
}
