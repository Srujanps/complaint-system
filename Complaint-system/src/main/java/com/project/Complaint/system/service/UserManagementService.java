package com.project.Complaint.system.service;

import com.project.Complaint.system.model.Role;
import com.project.Complaint.system.model.User;
import com.project.Complaint.system.model.UserResponse;
import com.project.Complaint.system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserManagementService {

    @Autowired
    private UserRepository userRepository;

    // Get all users
    public List<UserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }

    // Get users by role
    public List<UserResponse> getUsersByRole(Role role) {
        List<User> users = userRepository.findByRole(role);
        return users.stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }

    // Get user by ID
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserResponse(user);
    }

    // Delete user
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }

    // Get user statistics
    public java.util.Map<String, Long> getUserStatistics() {
        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        stats.put("total", userRepository.count());
        stats.put("CITIZEN", (long) userRepository.findByRole(Role.CITIZEN).size());
        stats.put("OFFICER", (long) userRepository.findByRole(Role.OFFICER).size());
        stats.put("VENDOR", (long) userRepository.findByRole(Role.VENDOR).size());
        stats.put("ADMIN", (long) userRepository.findByRole(Role.ADMIN).size());
        stats.put("REPRESENTATIVE", (long) userRepository.findByRole(Role.REPRESENTATIVE).size());
        return stats;
    }
}
