package com.project.Complaint.system.repository;

import com.project.Complaint.system.model.ContractStatus;
import com.project.Complaint.system.model.User;
import com.project.Complaint.system.model.VendorContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VendorContractRepository extends JpaRepository<VendorContract, Long> {

    Optional<VendorContract> findByContractNumber(String contractNumber);

    boolean existsByContractNumber(String contractNumber);

    List<VendorContract> findByVendor(User vendor);

    List<VendorContract> findByVendor_UserId(Long vendorId);

    List<VendorContract> findByDepartment(String department);

    List<VendorContract> findByDepartmentAndStatus(String department, ContractStatus status);

    List<VendorContract> findByStatus(ContractStatus status);
}

