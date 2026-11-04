package com.project.Complaint.system.repository;

import com.project.Complaint.system.model.Assignment;
import com.project.Complaint.system.model.AssignmentStatus;
import com.project.Complaint.system.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    // Find assignments by vendor
    List<Assignment> findByVendor(User vendor);

    // Find assignments by vendor and status
    List<Assignment> findByVendorAndStatus(User vendor, AssignmentStatus status);

    // Find assignment by complaint ID
    Optional<Assignment> findByComplaint_ComplaintId(Long complaintId);

    // Find assignment by work order number
    Optional<Assignment> findByWorkOrderNumber(String workOrderNumber);

    // Count assignments by vendor
    long countByVendor(User vendor);

    // Count completed assignments by vendor
    long countByVendorAndStatus(User vendor, AssignmentStatus status);
}