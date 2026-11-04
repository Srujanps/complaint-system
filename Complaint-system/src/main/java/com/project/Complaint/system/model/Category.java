package com.project.Complaint.system.model;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long categoryId;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    private Integer baseSeverityWeight = 5;

    // Constructors
    public Category() {}

    public Category(String name, String description, Integer baseSeverityWeight) {
        this.name = name;
        this.description = description;
        this.baseSeverityWeight = baseSeverityWeight;
    }

    // Getters and Setters
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getName() { return name; }
    public String getCategoryName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getBaseSeverityWeight() { return baseSeverityWeight; }
    public void setBaseSeverityWeight(Integer baseSeverityWeight) { this.baseSeverityWeight = baseSeverityWeight; }
}