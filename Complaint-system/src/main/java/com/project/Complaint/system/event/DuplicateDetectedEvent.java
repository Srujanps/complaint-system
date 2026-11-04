package com.project.Complaint.system.event;

import com.project.Complaint.system.model.Complaint;
import org.springframework.context.ApplicationEvent;

public class DuplicateDetectedEvent extends ApplicationEvent {
    private final Complaint newComplaint;
    private final Complaint existingComplaint;
    private final double similarityScore;

    public DuplicateDetectedEvent(Object source, Complaint newComplaint, Complaint existingComplaint, double similarityScore) {
        super(source);
        this.newComplaint = newComplaint;
        this.existingComplaint = existingComplaint;
        this.similarityScore = similarityScore;
    }

    public Complaint getNewComplaint() { return newComplaint; }
    public Complaint getExistingComplaint() { return existingComplaint; }
    public double getSimilarityScore() { return similarityScore; }
}
