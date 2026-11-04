package com.project.Complaint.system.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String fullName;

    private String phone;

    private String constituency;

    private String designation;

    @Column(nullable = false)
    private Boolean isEmailVerified = false;

    private String emailVerificationToken;

    private LocalDateTime emailVerificationTokenExpiry;

    @Column(nullable = false, length = 10)
    private String preferredLanguage = "EN";

    @CreationTimestamp
    private LocalDateTime createdAt;

    public User() {}

    public User(Long userId, String username, String password, String email, Role role, String fullName, String phone, String constituency, String designation, Boolean isEmailVerified, String emailVerificationToken, LocalDateTime emailVerificationTokenExpiry, String preferredLanguage, LocalDateTime createdAt) {
        this.userId = userId;
        this.username = username;
        this.password = password;
        this.email = email;
        this.role = role;
        this.fullName = fullName;
        this.phone = phone;
        this.constituency = constituency;
        this.designation = designation;
        this.isEmailVerified = isEmailVerified;
        this.emailVerificationToken = emailVerificationToken;
        this.emailVerificationTokenExpiry = emailVerificationTokenExpiry;
        this.preferredLanguage = preferredLanguage;
        this.createdAt = createdAt;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getConstituency() { return constituency; }
    public void setConstituency(String constituency) { this.constituency = constituency; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public Boolean getIsEmailVerified() { return isEmailVerified; }
    public void setIsEmailVerified(Boolean isEmailVerified) { this.isEmailVerified = isEmailVerified; }

    public String getEmailVerificationToken() { return emailVerificationToken; }
    public void setEmailVerificationToken(String emailVerificationToken) { this.emailVerificationToken = emailVerificationToken; }

    public LocalDateTime getEmailVerificationTokenExpiry() { return emailVerificationTokenExpiry; }
    public void setEmailVerificationTokenExpiry(LocalDateTime emailVerificationTokenExpiry) { this.emailVerificationTokenExpiry = emailVerificationTokenExpiry; }

    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
