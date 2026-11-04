package com.project.Complaint.system.model;

public class AuthResponse {
    private String token;
    private String username;
    private Role role;
    private String message;
    private String constituency;
    private String designation;

    public AuthResponse() {}

    public AuthResponse(String token, String username, Role role, String message, String constituency, String designation) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.message = message;
        this.constituency = constituency;
        this.designation = designation;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getConstituency() { return constituency; }
    public void setConstituency(String constituency) { this.constituency = constituency; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
}
