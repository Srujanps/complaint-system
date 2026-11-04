package com.project.Complaint.system.repository;

import com.project.Complaint.system.model.AdminNotificationSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminNotificationSettingsRepository extends JpaRepository<AdminNotificationSettings, Long> {
}
