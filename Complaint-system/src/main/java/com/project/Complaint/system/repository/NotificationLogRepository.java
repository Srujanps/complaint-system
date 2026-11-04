package com.project.Complaint.system.repository;

import com.project.Complaint.system.model.NotificationLog;
import com.project.Complaint.system.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    List<NotificationLog> findByRecipientOrderBySentAtDesc(User recipient);
    Page<NotificationLog> findAllByOrderBySentAtDesc(Pageable pageable);
    List<NotificationLog> findTop20ByRecipientOrderBySentAtDesc(User recipient);
}
