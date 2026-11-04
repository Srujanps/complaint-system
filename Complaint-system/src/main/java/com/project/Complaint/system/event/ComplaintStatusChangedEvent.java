package com.project.Complaint.system.event;

import com.project.Complaint.system.model.Complaint;
import com.project.Complaint.system.model.ComplaintStatus;
import com.project.Complaint.system.model.User;
import org.springframework.context.ApplicationEvent;

public class ComplaintStatusChangedEvent extends ApplicationEvent {
    private final Complaint complaint;
    private final ComplaintStatus oldStatus;
    private final ComplaintStatus newStatus;
    private final String officialNote;
    private final User actor;

    public ComplaintStatusChangedEvent(Object source, Complaint complaint, ComplaintStatus oldStatus, ComplaintStatus newStatus, String officialNote, User actor) {
        super(source);
        this.complaint = complaint;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.officialNote = officialNote;
        this.actor = actor;
    }

    public Complaint getComplaint() { return complaint; }
    public ComplaintStatus getOldStatus() { return oldStatus; }
    public ComplaintStatus getNewStatus() { return newStatus; }
    public String getOfficialNote() { return officialNote; }
    public User getActor() { return actor; }
}
