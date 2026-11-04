package com.project.Complaint.system.event;

import com.project.Complaint.system.model.Complaint;
import org.springframework.context.ApplicationEvent;

public class ComplaintCreatedEvent extends ApplicationEvent {
    private final Complaint complaint;

    public ComplaintCreatedEvent(Object source, Complaint complaint) {
        super(source);
        this.complaint = complaint;
    }

    public Complaint getComplaint() {
        return complaint;
    }
}
