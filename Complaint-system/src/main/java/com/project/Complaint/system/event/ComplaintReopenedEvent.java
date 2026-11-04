package com.project.Complaint.system.event;

import com.project.Complaint.system.model.Complaint;
import org.springframework.context.ApplicationEvent;

public class ComplaintReopenedEvent extends ApplicationEvent {
    private final Complaint complaint;
    private final String reason;

    public ComplaintReopenedEvent(Object source, Complaint complaint, String reason) {
        super(source);
        this.complaint = complaint;
        this.reason = reason;
    }

    public Complaint getComplaint() { return complaint; }
    public String getReason() { return reason; }
}
