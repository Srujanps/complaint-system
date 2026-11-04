package com.project.Complaint.system.service;

import com.project.Complaint.system.event.SLANotificationEvent;
import com.project.Complaint.system.model.Complaint;
import com.project.Complaint.system.model.ComplaintStatus;
import com.project.Complaint.system.repository.ComplaintRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@EnableScheduling
public class SLAMonitoringScheduler {

    private static final Logger logger = LoggerFactory.getLogger(SLAMonitoringScheduler.class);

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    private static final List<ComplaintStatus> CLOSED_STATUSES = Arrays.asList(
            ComplaintStatus.RESOLVED,
            ComplaintStatus.CLOSED,
            ComplaintStatus.REJECTED
    );

    @Scheduled(fixedRate = 300000, initialDelay = 10000) // Check every 5 minutes
    public void monitorSLADeadlines() {
        logger.info("⏱ Running SLA Deadline Monitoring Scheduler...");
        List<Complaint> activeComplaints = complaintRepository.findByStatusNotIn(CLOSED_STATUSES);

        LocalDateTime now = LocalDateTime.now();

        for (Complaint complaint : activeComplaints) {
            if (complaint.getSlaDeadline() == null) {
                // Initialize default 48 hour SLA deadline if missing
                LocalDateTime created = complaint.getCreatedAt() != null ? complaint.getCreatedAt() : now;
                int hours = complaint.getSlaTargetHours() != null ? complaint.getSlaTargetHours() : 48;
                complaint.setSlaDeadline(created.plusHours(hours));
                complaintRepository.save(complaint);
            }

            Duration remaining = Duration.between(now, complaint.getSlaDeadline());
            long remainingMinutes = remaining.toMinutes();

            // SLA Warning Trigger (< 12 hours remaining and warning not sent)
            if (remainingMinutes > 0 && remainingMinutes <= 720 && !Boolean.TRUE.equals(complaint.getSlaWarningSent())) {
                complaint.setSlaWarningSent(true);
                complaintRepository.save(complaint);
                eventPublisher.publishEvent(new SLANotificationEvent(this, complaint, SLANotificationEvent.SLAType.WARNING, remainingMinutes));
                logger.warn("⚠ SLA Warning triggered for complaint {}", complaint.getComplaintRef());
            }
            // SLA Breach Trigger (deadline passed and breach notification not sent)
            else if (remainingMinutes <= 0 && !Boolean.TRUE.equals(complaint.getSlaBreachSent())) {
                complaint.setSlaBreachSent(true);
                complaint.setIsEscalated(true);
                complaint.setEscalatedAt(now);
                complaint.setStatus(ComplaintStatus.ESCALATED);
                complaintRepository.save(complaint);

                eventPublisher.publishEvent(new SLANotificationEvent(this, complaint, SLANotificationEvent.SLAType.BREACH, remainingMinutes));
                logger.error("🔴 SLA Breach triggered and complaint {} escalated!", complaint.getComplaintRef());
            }
        }
    }
}
