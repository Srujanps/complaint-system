package com.project.Complaint.system.repository;

import com.project.Complaint.system.model.Complaint;
import com.project.Complaint.system.model.ComplaintStatus;
import com.project.Complaint.system.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    // Find complaints by citizen
    List<Complaint> findByCitizen(User citizen);

    // Find complaints by status
    List<Complaint> findByStatus(ComplaintStatus status);

    // Find all with pagination
    Page<Complaint> findAll(Pageable pageable);

    // Find by status with pagination
    Page<Complaint> findByStatus(ComplaintStatus status, Pageable pageable);

    // Count by status
    long countByStatus(ComplaintStatus status);

    // ── Representative: area-based queries ──────────────────────────────────

    // Find complaints whose location contains the area keyword (case-insensitive)
    Page<Complaint> findByLocationContainingIgnoreCase(String area, Pageable pageable);

    // Count complaints in area by status (for dashboard stats)
    long countByLocationContainingIgnoreCaseAndStatus(String area, ComplaintStatus status);

    // Find by reference code
    java.util.Optional<Complaint> findByComplaintRef(String complaintRef);

    // Find active complaints for SLA monitoring
    List<Complaint> findByStatusNotIn(List<ComplaintStatus> closedStatuses);

    // Count all complaints in area (for total stat card)
    long countByLocationContainingIgnoreCase(String area);

    // Haversine formula to find nearby complaints within radius (in meters) with status NOT IN ('RESOLVED', 'CLOSED')
    @Query(value = "SELECT * FROM complaints c " +
           "WHERE c.status NOT IN ('RESOLVED', 'CLOSED') " +
           "AND c.latitude IS NOT NULL AND c.longitude IS NOT NULL " +
           "AND (6371000 * acos( " +
           "    cos(radians(:lat)) * cos(radians(c.latitude)) * " +
           "    cos(radians(c.longitude) - radians(:lng)) + " +
           "    sin(radians(:lat)) * sin(radians(c.latitude)) " +
           ")) <= :radiusMeters", 
           nativeQuery = true)
    List<Complaint> findNearbyOpenComplaints(@Param("lat") double lat, 
                                            @Param("lng") double lng, 
                                            @Param("radiusMeters") double radiusMeters);
}