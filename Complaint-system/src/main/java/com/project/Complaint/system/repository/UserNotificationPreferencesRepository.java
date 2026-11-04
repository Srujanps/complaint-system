package com.project.Complaint.system.repository;

import com.project.Complaint.system.model.User;
import com.project.Complaint.system.model.UserNotificationPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserNotificationPreferencesRepository extends JpaRepository<UserNotificationPreferences, Long> {
    Optional<UserNotificationPreferences> findByUser(User user);
    Optional<UserNotificationPreferences> findByUser_UserId(Long userId);
}
