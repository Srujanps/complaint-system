package com.project.Complaint.system.model;

import java.time.LocalDateTime;

public class UserResponse {

    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String role;
    private String constituency;
    private String designation;
    private LocalDateTime createdAt;

    // Constructor
    public UserResponse(User user) {
        this.userId = user.getUserId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.fullName = user.getFullName();
        this.phone = user.getPhone();
        this.role = user.getRole().name();
        this.constituency = user.getConstituency();
        this.designation = user.getDesignation();
        this.createdAt = user.getCreatedAt();
    }

    // Getters
    public Long getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
    public String getPhone() { return phone; }
    public String getRole() { return role; }
    public String getConstituency() { return constituency; }
    public String getDesignation() { return designation; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
