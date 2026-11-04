package com.project.Complaint.system.config;

import com.project.Complaint.system.model.*;
import com.project.Complaint.system.repository.AssignmentRepository;
import com.project.Complaint.system.repository.CategoryRepository;
import com.project.Complaint.system.repository.ComplaintRepository;
import com.project.Complaint.system.repository.UserRepository;
import com.project.Complaint.system.repository.VendorContractRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private VendorContractRepository contractRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Initialize categories if they don't exist
        if (categoryRepository.count() == 0) {
            categoryRepository.save(new Category("Road Damage", "Potholes, cracks, damaged roads", 8));
            categoryRepository.save(new Category("Street Lights", "Non-functional or damaged street lights", 5));
            categoryRepository.save(new Category("Garbage", "Waste management issues", 6));
            categoryRepository.save(new Category("Water Supply", "Water leakage, supply issues", 9));
            categoryRepository.save(new Category("Drainage", "Blocked drains, sewage issues", 7));

            System.out.println("✅ Categories initialized");
        }

        // 2. Initialize seed demo users and specialized vendors if they don't exist
        if (userRepository.count() == 0) {
            createDemoUser("citizen", "citizen@example.com", "password123", Role.CITIZEN, "Aarav Sharma", "+91 98765 43210", "Ward 12", "Citizen");
            createDemoUser("officer", "officer@example.com", "password123", Role.OFFICER, "Rajesh Varma", "+91 98765 43211", "Ward 12", "Ward Nodal Officer");
            createDemoUser("representative", "rep@example.com", "password123", Role.REPRESENTATIVE, "Priya Deshmukh", "+91 98765 43213", "Ward 12 - Central District", "Elected Ward Representative");
            createDemoUser("admin", "admin@example.com", "password123", Role.ADMIN, "System Administrator", "+91 98765 43214", "HQ", "Chief Administrator");

            // Specialized Registered Vendors
            createDemoUser("vendor", "vendor@example.com", "password123", Role.VENDOR, "Sunil Patil", "+91 98765 43212", "Ward 12", "QuickFix Infra Services (Roads & Asphalt Specialist)");
            createDemoUser("vendor_water", "vendor_water@example.com", "password123", Role.VENDOR, "Kavita Rao", "+91 98765 43215", "Ward 12", "Jal Seva Water Works (Water Supply & Pipeline Specialist)");
            createDemoUser("vendor_electric", "vendor_electric@example.com", "password123", Role.VENDOR, "Imran Khan", "+91 98765 43216", "Ward 12", "BrightLine Electricals (Street Lights & Grid Specialist)");
            createDemoUser("vendor_sanitation", "vendor_sanitation@example.com", "password123", Role.VENDOR, "Deepak Sawant", "+91 98765 43217", "Ward 12", "EcoClean Waste Management (Solid Waste & Sanitation)");

            System.out.println("✅ Demo users and specialized vendors initialized with verified email status");
        } else {
            // Ensure all specialized vendors exist even if database already has users
            ensureVendorExists("vendor", "vendor@example.com", "Sunil Patil", "Ward 12", "QuickFix Infra Services (Roads & Asphalt Specialist)");
            ensureVendorExists("vendor_water", "vendor_water@example.com", "Kavita Rao", "Ward 12", "Jal Seva Water Works (Water Supply & Pipeline Specialist)");
            ensureVendorExists("vendor_electric", "vendor_electric@example.com", "Imran Khan", "Ward 12", "BrightLine Electricals (Street Lights & Grid Specialist)");
            ensureVendorExists("vendor_sanitation", "vendor_sanitation@example.com", "Deepak Sawant", "Ward 12", "EcoClean Waste Management (Solid Waste & Sanitation)");
        }

        // 3. Initialize sample complaints for the demo citizen so chatbot tracking is immediately testable
        if (complaintRepository.count() == 0) {
            User citizen = userRepository.findByUsername("citizen").orElse(null);
            Category roadCat = categoryRepository.findByName("Road Damage").orElse(null);
            Category waterCat = categoryRepository.findByName("Water Supply").orElse(null);
            User roadVendor = userRepository.findByUsername("vendor").orElse(null);
            User officer = userRepository.findByUsername("officer").orElse(null);

            if (citizen != null && roadCat != null) {
                Complaint c1 = new Complaint();
                c1.setTitle("Severe Road Pothole & Asphalt Damage");
                c1.setDescription("Deep road surface pothole near City Mall junction creating vehicular hazard. Urgent municipal asphalt patch squad inspection required.");
                c1.setLocation("City Mall Junction, MG Road, Ward 12");
                c1.setCitizen(citizen);
                c1.setCategory(roadCat);
                c1.setStatus(ComplaintStatus.IN_PROGRESS);
                c1.setPriority(Priority.HIGH);
                c1.setSeverityScore(8);
                c1.setSlaTargetHours(24);
                c1.setSlaDeadline(LocalDateTime.now().plusHours(18));
                c1.setComplaintRef("GRV-2026-000001");
                c1.setIsAiProcessed(true);
                c1.setAiCategoryName("Road Damage");
                c1.setAiSeverityScore(8);
                c1.setAiAnalysisReasoning("AI Vision identified severe asphalt damage.");
                complaintRepository.save(c1);

                if (roadVendor != null) {
                    Assignment a = new Assignment();
                    a.setComplaint(c1);
                    a.setVendor(roadVendor);
                    a.setAssignedBy(officer);
                    a.setStatus(AssignmentStatus.IN_PROGRESS);
                    a.setNotes("High priority asphalt patch squad dispatched to site.");
                    assignmentRepository.save(a);
                }
            }

            if (citizen != null && waterCat != null) {
                Complaint c2 = new Complaint();
                c2.setTitle("Water Supply Pipeline Rupture & Leakage");
                c2.setDescription("Continuous clean drinking water leakage from underground distribution pipe flooding the street.");
                c2.setLocation("Opposite City Hospital, 2nd Cross, Ward 12");
                c2.setCitizen(citizen);
                c2.setCategory(waterCat);
                c2.setStatus(ComplaintStatus.RECEIVED);
                c2.setPriority(Priority.HIGH);
                c2.setSeverityScore(8);
                c2.setSlaTargetHours(24);
                c2.setSlaDeadline(LocalDateTime.now().plusHours(22));
                c2.setComplaintRef("GRV-2026-000002");
                c2.setIsAiProcessed(true);
                c2.setAiCategoryName("Water Supply");
                c2.setAiSeverityScore(8);
                c2.setAiAnalysisReasoning("AI Vision identified clean water pipeline rupture.");
                complaintRepository.save(c2);
            }

            System.out.println("✅ Sample complaints initialized for demo tracking");
        }

        // 4. Initialize vendor contracts if they don't exist
        if (contractRepository.count() == 0) {
            User roadVendor = userRepository.findByUsername("vendor").orElse(null);
            User waterVendor = userRepository.findByUsername("vendor_water").orElse(null);
            User electricVendor = userRepository.findByUsername("vendor_electric").orElse(null);
            User sanitationVendor = userRepository.findByUsername("vendor_sanitation").orElse(null);

            if (roadVendor != null) {
                contractRepository.save(new VendorContract(
                        "CNT-2026-RD-001",
                        roadVendor,
                        "Road Maintenance",
                        "Annual Municipal Road Patching & Asphalt Restoration",
                        2500000.0,
                        LocalDate.of(2026, 1, 1),
                        LocalDate.of(2026, 12, 31),
                        ContractStatus.ACTIVE,
                        "Ward 12, Ward 13, Ward 14",
                        "Road Damage, Potholes, Asphalt Repair",
                        24,
                        "Standard Bituminous Patching: Rs 550/sq.m; Trench Reinstatement: Rs 750/sq.m",
                        "Traffic safety barricades mandatory. Heavy machinery restricted to night hours on main roads."
                ));
            }

            if (waterVendor != null) {
                contractRepository.save(new VendorContract(
                        "CNT-2026-WS-002",
                        waterVendor,
                        "Water Supply",
                        "Ward Pipeline Maintenance & Sewage Jetting Master Agreement",
                        3200000.0,
                        LocalDate.of(2026, 1, 1),
                        LocalDate.of(2026, 12, 31),
                        ContractStatus.ACTIVE,
                        "Ward 12, Ward 15, Central District",
                        "Water Supply, Drainage, Pipeline Leakage, Sewage Overflow",
                        24,
                        "Pipe Clamp Joint Replacement: Rs 1200/joint; High-Pressure Drain Jetting: Rs 3500/stretch",
                        "Potable water supply restoration requires water quality/chlorination test report."
                ));
            }

            if (electricVendor != null) {
                contractRepository.save(new VendorContract(
                        "CNT-2026-EM-003",
                        electricVendor,
                        "Electrical Maintenance",
                        "Public Street Lighting & Luminaire Maintenance Contract",
                        1800000.0,
                        LocalDate.of(2026, 1, 1),
                        LocalDate.of(2026, 12, 31),
                        ContractStatus.ACTIVE,
                        "Ward 12, Ward 11, Ward 10",
                        "Street Lights, Electrical Hazard, Cable Jointing",
                        36,
                        "LED Luminaire 120W Replacement: Rs 2200/unit; Cable Fault Restoration: Rs 1500/point",
                        "Dielectric gloves and safety harnesses mandatory. Isolation permit required before high-voltage work."
                ));
            }

            if (sanitationVendor != null) {
                contractRepository.save(new VendorContract(
                        "CNT-2026-SW-004",
                        sanitationVendor,
                        "Sanitation and Waste Management",
                        "Municipal Solid Waste Clearance & Illegal Dump Remediation",
                        2100000.0,
                        LocalDate.of(2026, 1, 1),
                        LocalDate.of(2026, 12, 31),
                        ContractStatus.ACTIVE,
                        "Ward 12, Ward 13, Ward 14, Ward 15",
                        "Garbage, Solid Waste, Bulk Dump, Street Litter",
                        24,
                        "Compactor Truck Clearance: Rs 1800/ton; Mechanical Sweeping: Rs 400/km",
                        "Disposal at authorized municipal landfill only. Weighbridge slip required for proof of clearance."
                ));
            }

            System.out.println("✅ Vendor contracts initialized with active government contractor agreements");
        }
    }

    private void ensureVendorExists(String username, String email, String fullName, String constituency, String designation) {
        if (!userRepository.existsByUsername(username)) {
            createDemoUser(username, email, "password123", Role.VENDOR, fullName, "+91 98765 43210", constituency, designation);
        }
    }

    private void createDemoUser(String username, String email, String rawPassword, Role role, String fullName, String phone, String constituency, String designation) {
        User u = new User();
        u.setUsername(username);
        u.setEmail(email);
        u.setPassword(passwordEncoder.encode(rawPassword));
        u.setRole(role);
        u.setFullName(fullName);
        u.setPhone(phone);
        u.setConstituency(constituency);
        u.setDesignation(designation);
        u.setIsEmailVerified(true);
        u.setPreferredLanguage("EN");
        userRepository.save(u);
    }
}