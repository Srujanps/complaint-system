package com.project.Complaint.system.controller;

import com.project.Complaint.system.model.Category;
import com.project.Complaint.system.model.Role;
import com.project.Complaint.system.model.UserResponse;
import com.project.Complaint.system.repository.CategoryRepository;
import com.project.Complaint.system.repository.ComplaintRepository;
import com.project.Complaint.system.service.UserManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserManagementService userManagementService;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    // ==================== USER MANAGEMENT ====================

    // Get all users
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<UserResponse> users = userManagementService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get users by role
    @GetMapping("/users/role/{role}")
    public ResponseEntity<?> getUsersByRole(@PathVariable String role) {
        try {
            Role userRole = Role.valueOf(role.toUpperCase());
            List<UserResponse> users = userManagementService.getUsersByRole(userRole);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get user by ID
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            UserResponse user = userManagementService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Delete user
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userManagementService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== CATEGORY MANAGEMENT ====================

    // Get all categories
    @GetMapping("/categories")
    public ResponseEntity<?> getAllCategories() {
        try {
            List<Category> categories = categoryRepository.findAll();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Create category
    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@RequestBody Category category) {
        try {
            if (categoryRepository.existsByName(category.getName())) {
                return ResponseEntity.badRequest().body("Category already exists");
            }
            Category saved = categoryRepository.save(category);
            return ResponseEntity.status(201).body(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Update category
    @PutMapping("/categories/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        try {
            Category existing = categoryRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Category not found"));

            existing.setName(category.getName());
            existing.setDescription(category.getDescription());
            existing.setBaseSeverityWeight(category.getBaseSeverityWeight());

            Category updated = categoryRepository.save(existing);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Delete category
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            Category category = categoryRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            categoryRepository.delete(category);
            return ResponseEntity.ok(Map.of("message", "Category deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================== ANALYTICS ====================

    // Get system statistics
    @GetMapping("/statistics")
    public ResponseEntity<?> getStatistics() {
        try {
            Map<String, Object> stats = new HashMap<>();

            // User statistics
            stats.put("users", userManagementService.getUserStatistics());

            // Complaint statistics
            Map<String, Long> complaintStats = new HashMap<>();
            complaintStats.put("total", complaintRepository.count());
            stats.put("complaints", complaintStats);

            // Category statistics
            stats.put("totalCategories", categoryRepository.count());

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}