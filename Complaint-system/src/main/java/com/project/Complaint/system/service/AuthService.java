package com.project.Complaint.system.service;

import com.project.Complaint.system.event.UserRegisteredEvent;
import com.project.Complaint.system.model.*;
import com.project.Complaint.system.repository.UserRepository;
import com.project.Complaint.system.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole() != null ? request.getRole() : Role.CITIZEN);
        user.setPreferredLanguage(request.getPreferredLanguage() != null ? request.getPreferredLanguage().toUpperCase() : "EN");

        // Generate email verification token for citizens
        if (user.getRole() == Role.CITIZEN) {
            user.setIsEmailVerified(false);
            user.setEmailVerificationToken(UUID.randomUUID().toString());
            user.setEmailVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        } else {
            // Administrative/Officer roles auto-verified
            user.setIsEmailVerified(true);
        }

        if (user.getRole() == Role.REPRESENTATIVE) {
            if (request.getConstituency() == null || request.getConstituency().isBlank()) {
                throw new RuntimeException("Constituency is required for Representative");
            }
            user.setConstituency(request.getConstituency().trim());
            user.setDesignation(request.getDesignation() != null ? request.getDesignation().trim() : null);
        }

        User savedUser = userRepository.save(user);

        // Publish registration event asynchronously
        eventPublisher.publishEvent(new UserRegisteredEvent(this, savedUser, true));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtUtil.generateToken(userDetails);

        return new AuthResponse(token, user.getUsername(), user.getRole(),
                user.getIsEmailVerified() ? "Registration successful" : "Registration successful. Please verify your email address.",
                user.getConstituency(), user.getDesignation());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String token = jwtUtil.generateToken(userDetails);

        return new AuthResponse(token, user.getUsername(), user.getRole(), "Login successful",
                user.getConstituency(), user.getDesignation());
    }

    public String verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired verification token"));

        if (user.getEmailVerificationTokenExpiry() != null && user.getEmailVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification token has expired. Please request a new verification email.");
        }

        user.setIsEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationTokenExpiry(null);
        userRepository.save(user);

        // Publish Welcome Email
        eventPublisher.publishEvent(new UserRegisteredEvent(this, user, true));

        return "Email verified successfully! You can now log in to the portal.";
    }

    public String resendVerification(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No user found with email: " + email));

        if (Boolean.TRUE.equals(user.getIsEmailVerified())) {
            return "Email is already verified.";
        }

        user.setEmailVerificationToken(UUID.randomUUID().toString());
        user.setEmailVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        eventPublisher.publishEvent(new UserRegisteredEvent(this, user, false));

        return "Verification email resent successfully.";
    }
}
