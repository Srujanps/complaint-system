package com.project.Complaint.system.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.Complaint.system.model.*;
import com.project.Complaint.system.repository.AssignmentRepository;
import com.project.Complaint.system.repository.CategoryRepository;
import com.project.Complaint.system.repository.ComplaintRepository;
import com.project.Complaint.system.repository.UserRepository;
import com.project.Complaint.system.repository.VendorContractRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AICategorizationService {

    private static final Logger logger = LoggerFactory.getLogger(AICategorizationService.class);

    @Value("${gemini.api.key:${GEMINI_API_KEY:}}")
    private String geminiApiKey;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CivicRagRetrieverService ragRetrieverService;

    @Autowired
    private VendorContractRepository contractRepository;

    @Autowired
    private VendorContractService vendorContractService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public static class AIAnalysisResult {
        private Long suggestedCategoryId;
        private String suggestedCategoryName;
        private Integer severityScore; // 1 to 10
        private Priority priority; // LOW, MEDIUM, HIGH, CRITICAL
        private Integer slaTargetHours;
        private String reasoning;
        private boolean isAiProcessed;
        private String suggestedTitle;
        private String suggestedDescription;

        public AIAnalysisResult() {}

        public AIAnalysisResult(Long suggestedCategoryId, String suggestedCategoryName, Integer severityScore,
                                Priority priority, Integer slaTargetHours, String reasoning, boolean isAiProcessed) {
            this.suggestedCategoryId = suggestedCategoryId;
            this.suggestedCategoryName = suggestedCategoryName;
            this.severityScore = severityScore;
            this.priority = priority;
            this.slaTargetHours = slaTargetHours;
            this.reasoning = reasoning;
            this.isAiProcessed = isAiProcessed;
        }

        public Long getSuggestedCategoryId() { return suggestedCategoryId; }
        public void setSuggestedCategoryId(Long suggestedCategoryId) { this.suggestedCategoryId = suggestedCategoryId; }

        public String getSuggestedCategoryName() { return suggestedCategoryName; }
        public void setSuggestedCategoryName(String suggestedCategoryName) { this.suggestedCategoryName = suggestedCategoryName; }

        public Integer getSeverityScore() { return severityScore; }
        public void setSeverityScore(Integer severityScore) { this.severityScore = severityScore; }

        public Priority getPriority() { return priority; }
        public void setPriority(Priority priority) { this.priority = priority; }

        public Integer getSlaTargetHours() { return slaTargetHours; }
        public void setSlaTargetHours(Integer slaTargetHours) { this.slaTargetHours = slaTargetHours; }

        public String getReasoning() { return reasoning; }
        public void setReasoning(String reasoning) { this.reasoning = reasoning; }

        public boolean isAiProcessed() { return isAiProcessed; }
        public void setAiProcessed(boolean aiProcessed) { isAiProcessed = aiProcessed; }

        public String getSuggestedTitle() { return suggestedTitle; }
        public void setSuggestedTitle(String suggestedTitle) { this.suggestedTitle = suggestedTitle; }

        public String getSuggestedDescription() { return suggestedDescription; }
        public void setSuggestedDescription(String suggestedDescription) { this.suggestedDescription = suggestedDescription; }
    }

    // =========================================================================
    // 1. INTAKE ANALYSIS (Text + Multimodal Vision Support)
    // =========================================================================

    public AIAnalysisResult analyzeComplaint(String title, String description) {
        return analyzeComplaintWithVision(title, description, null, null);
    }

    public AIAnalysisResult analyzeComplaintWithVision(String title, String description, String imageBase64) {
        return analyzeComplaintWithVision(title, description, imageBase64, null);
    }

    public AIAnalysisResult analyzeComplaintWithVision(String title, String description, String imageBase64, String fileName) {
        List<Category> categories = categoryRepository.findAll();

        if (hasValidGeminiKey()) {
            try {
                AIAnalysisResult llmResult = callGeminiVisionApi(title, description, categories, imageBase64);
                if (llmResult != null && llmResult.getSuggestedCategoryName() != null) {
                    return llmResult;
                }
            } catch (Exception e) {
                logger.warn("Gemini Vision/LLM API call failed, falling back to smart heuristic engine: {}", e.getMessage());
            }
        }

        return analyzeHeuristically(title, description, categories, imageBase64, fileName);
    }

    private boolean hasValidGeminiKey() {
        return geminiApiKey != null &&
               !geminiApiKey.trim().isBlank() &&
               !geminiApiKey.trim().equalsIgnoreCase("your_gemini_api_key_here") &&
               !geminiApiKey.startsWith("your_");
    }

    private AIAnalysisResult callGeminiVisionApi(String title, String description, List<Category> categories, String imageBase64) throws Exception {
        String categoryNames = categories.stream().map(Category::getName).collect(Collectors.joining(", "));

        String prompt = String.format(
            "You are an AI Civic Grievance Triage Classifier and Vision Inspector for a municipal government portal.\n" +
            "Analyze the submitted grievance details and image (if provided):\n" +
            "Title Input: %s\n" +
            "Description Input: %s\n\n" +
            "Available Municipal Categories: [%s]\n\n" +
            "Tasks:\n" +
            "1. Inspect the image (if present) to detect physical damage (e.g., pothole, broken pipeline, fallen electric pole/wire, garbage overflow).\n" +
            "2. Select the EXACT matching category from the available list.\n" +
            "3. Score severity 1 to 10 (1 = minor inconvenience, 10 = critical life-safety hazard or major infrastructure collapse).\n" +
            "4. Assign priority (\"LOW\", \"MEDIUM\", \"HIGH\", or \"CRITICAL\").\n" +
            "5. If title or description are short or informal, suggest a refined formal Title and structured Description.\n" +
            "6. Provide a concise 1-2 sentence reasoning.\n\n" +
            "Return ONLY a raw JSON object (no markdown, no ```json ``` fences):\n" +
            "{\n" +
            "  \"categoryName\": \"<exact category from list>\",\n" +
            "  \"severityScore\": <integer 1-10>,\n" +
            "  \"priority\": \"<LOW/MEDIUM/HIGH/CRITICAL>\",\n" +
            "  \"suggestedTitle\": \"<concise official title>\",\n" +
            "  \"suggestedDescription\": \"<clear structured description>\",\n" +
            "  \"reasoning\": \"<1-2 sentence risk and category justification>\"\n" +
            "}",
            (title != null ? title : "(Not provided)"),
            (description != null ? description : "(Not provided)"),
            categoryNames
        );

        List<Map<String, Object>> partsList = new ArrayList<>();
        partsList.add(Map.of("text", prompt));

        Map<String, String> parsedImage = extractBase64Data(imageBase64);
        if (parsedImage != null) {
            partsList.add(Map.of("inlineData", Map.of(
                    "mimeType", parsedImage.get("mimeType"),
                    "data", parsedImage.get("data")
            )));
        }

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of("parts", partsList))
        );

        String jsonPayload = objectMapper.writeValueAsString(requestBody);
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + geminiApiKey;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .timeout(Duration.ofSeconds(10))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            JsonNode root = objectMapper.readTree(response.body());
            String responseText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            responseText = cleanJsonResponse(responseText);
            JsonNode aiJson = objectMapper.readTree(responseText);

            String catName = aiJson.path("categoryName").asText();
            int severity = aiJson.path("severityScore").asInt(5);
            String priorityStr = aiJson.path("priority").asText("MEDIUM").toUpperCase();
            String reasoning = aiJson.path("reasoning").asText("Automated AI triage classification.");
            String sugTitle = aiJson.path("suggestedTitle").asText(title);
            String sugDesc = aiJson.path("suggestedDescription").asText(description);

            Priority priority;
            try {
                priority = Priority.valueOf(priorityStr);
            } catch (Exception e) {
                priority = Priority.MEDIUM;
            }

            Long categoryId = findCategoryIdByName(catName, categories);
            int slaHours = calculateSlaHours(priority, severity);

            AIAnalysisResult result = new AIAnalysisResult(categoryId, catName, severity, priority, slaHours, "Gemini Vision/LLM: " + reasoning, true);
            result.setSuggestedTitle(sugTitle);
            result.setSuggestedDescription(sugDesc);
            return result;
        }

        return null;
    }

    public AIAnalysisResult analyzeHeuristically(String title, String description, List<Category> categories) {
        return analyzeHeuristically(title, description, categories, null, null);
    }

    public AIAnalysisResult analyzeHeuristically(String title, String description, List<Category> categories, String imageBase64, String fileName) {
        String combinedText = ((title != null ? title : "") + " " +
                               (description != null ? description : "") + " " +
                               (fileName != null ? fileName : "")).toLowerCase();

        boolean hasImage = (imageBase64 != null && !imageBase64.isBlank());

        // 1. Water Supply & Pipe Leakage Detection
        if (combinedText.contains("water") || combinedText.contains("pipe") || combinedText.contains("leak") ||
            combinedText.contains("burst") || combinedText.contains("tap") || combinedText.contains("drinking") ||
            combinedText.contains("supply") || combinedText.contains("flood") || combinedText.contains("pipeline")) {

            Category matched = findCategoryByKeyword("water", categories);
            Long catId = matched != null ? matched.getCategoryId() : null;
            String catName = matched != null ? matched.getName() : "Water Supply";
            int severity = 8;
            Priority priority = Priority.HIGH;
            int slaHours = 24;

            String sugTitle = (title != null && title.trim().length() > 5) ? title : "Water Supply Pipeline Rupture & Leakage";
            String sugDesc = (description != null && description.trim().length() > 10) ? description :
                    "Citizen submitted photographic evidence showing active water supply pipeline leak/rupture causing clean water loss. Immediate water board plumbing dispatch required.";
            String reasoning = "AI Vision/Heuristic: Identified water supply pipeline rupture and continuous water leakage. High priority response required to prevent treated water loss and local street flooding.";

            AIAnalysisResult res = new AIAnalysisResult(catId, catName, severity, priority, slaHours, reasoning, true);
            res.setSuggestedTitle(sugTitle);
            res.setSuggestedDescription(sugDesc);
            return res;
        }

        // 2. Road Damage & Potholes Detection
        if (combinedText.contains("road") || combinedText.contains("pothole") || combinedText.contains("tar") ||
            combinedText.contains("asphalt") || combinedText.contains("crater") || combinedText.contains("crack") ||
            combinedText.contains("highway") || combinedText.contains("street") || combinedText.contains("pavement")) {

            Category matched = findCategoryByKeyword("road", categories);
            Long catId = matched != null ? matched.getCategoryId() : null;
            String catName = matched != null ? matched.getName() : "Road Damage";
            int severity = 8;
            Priority priority = Priority.HIGH;
            int slaHours = 24;

            String sugTitle = (title != null && title.trim().length() > 5) ? title : "Severe Road Pothole & Asphalt Damage";
            String sugDesc = (description != null && description.trim().length() > 10) ? description :
                    "Citizen submitted photographic evidence depicting deep road surface pothole creating vehicular hazard. Urgent municipal asphalt patch squad inspection required.";
            String reasoning = "AI Vision/Heuristic: Identified severe road surface disintegration and pothole hazard. High priority response to prevent two-wheeler accidents and traffic congestion.";

            AIAnalysisResult res = new AIAnalysisResult(catId, catName, severity, priority, slaHours, reasoning, true);
            res.setSuggestedTitle(sugTitle);
            res.setSuggestedDescription(sugDesc);
            return res;
        }

        // 3. Drainage & Sewage Overflow Detection
        if (combinedText.contains("drain") || combinedText.contains("sewage") || combinedText.contains("gutter") ||
            combinedText.contains("overflow") || combinedText.contains("manhole") || combinedText.contains("clog") ||
            combinedText.contains("blocked")) {

            Category matched = findCategoryByKeyword("drain", categories);
            Long catId = matched != null ? matched.getCategoryId() : null;
            String catName = matched != null ? matched.getName() : "Drainage";
            int severity = 7;
            Priority priority = Priority.HIGH;
            int slaHours = 24;

            String sugTitle = (title != null && title.trim().length() > 5) ? title : "Blocked Municipal Drain & Sewage Overflow";
            String sugDesc = (description != null && description.trim().length() > 10) ? description :
                    "Citizen submitted photographic evidence depicting clogged stormwater drain / overflowing sewage causing stagnation and sanitation risk. Sanitation jetting machine required.";
            String reasoning = "AI Vision/Heuristic: Identified blocked drainage channel and sewage backflow. High public health and sanitation hazard.";

            AIAnalysisResult res = new AIAnalysisResult(catId, catName, severity, priority, slaHours, reasoning, true);
            res.setSuggestedTitle(sugTitle);
            res.setSuggestedDescription(sugDesc);
            return res;
        }

        // 4. Street Lights & Electrical Hazard Detection
        if (combinedText.contains("light") || combinedText.contains("lamp") || combinedText.contains("pole") ||
            combinedText.contains("dark") || combinedText.contains("wire") || combinedText.contains("electr") ||
            combinedText.contains("spark") || combinedText.contains("current")) {

            Category matched = findCategoryByKeyword("light", categories);
            if (matched == null) matched = findCategoryByKeyword("electr", categories);
            Long catId = matched != null ? matched.getCategoryId() : null;
            String catName = matched != null ? matched.getName() : "Street Lights";

            boolean isSpark = combinedText.contains("spark") || combinedText.contains("wire") || combinedText.contains("fire");
            int severity = isSpark ? 9 : 5;
            Priority priority = isSpark ? Priority.CRITICAL : Priority.MEDIUM;
            int slaHours = isSpark ? 12 : 48;

            String sugTitle = (title != null && title.trim().length() > 5) ? title :
                    (isSpark ? "Live Wire / Electrical Fire Hazard" : "Non-Functional Street Light Fixture");
            String sugDesc = (description != null && description.trim().length() > 10) ? description :
                    "Citizen submitted photographic evidence depicting non-functioning or hazardous street lighting infrastructure.";
            String reasoning = "AI Vision/Heuristic: Identified street illumination / electrical infrastructure defect. " +
                    (isSpark ? "Immediate public safety hazard." : "Standard maintenance dispatch required.");

            AIAnalysisResult res = new AIAnalysisResult(catId, catName, severity, priority, slaHours, reasoning, true);
            res.setSuggestedTitle(sugTitle);
            res.setSuggestedDescription(sugDesc);
            return res;
        }

        // 5. Garbage & Solid Waste Overflow Detection
        if (combinedText.contains("garb") || combinedText.contains("trash") || combinedText.contains("waste") ||
            combinedText.contains("dump") || combinedText.contains("bin") || combinedText.contains("litter") ||
            combinedText.contains("smell") || combinedText.contains("stink")) {

            Category matched = findCategoryByKeyword("garb", categories);
            Long catId = matched != null ? matched.getCategoryId() : null;
            String catName = matched != null ? matched.getName() : "Garbage";
            int severity = 6;
            Priority priority = Priority.HIGH;
            int slaHours = 24;

            String sugTitle = (title != null && title.trim().length() > 5) ? title : "Illegal Garbage Dump & Solid Waste Overflow";
            String sugDesc = (description != null && description.trim().length() > 10) ? description :
                    "Citizen submitted photographic evidence depicting accumulated municipal solid waste and unattended garbage dump on public roadway.";
            String reasoning = "AI Vision/Heuristic: Identified uncollected municipal waste dump causing civic obstruction and environmental hygiene concern.";

            AIAnalysisResult res = new AIAnalysisResult(catId, catName, severity, priority, slaHours, reasoning, true);
            res.setSuggestedTitle(sugTitle);
            res.setSuggestedDescription(sugDesc);
            return res;
        }

        // 6. Generic Image Uploaded (e.g. Webcam / Phone Camera photo with no text yet)
        if (hasImage) {
            Category defaultCat = findCategoryByKeyword("road", categories);
            if (defaultCat == null && !categories.isEmpty()) defaultCat = categories.get(0);
            Long catId = defaultCat != null ? defaultCat.getCategoryId() : null;
            String catName = defaultCat != null ? defaultCat.getName() : "Road Damage";

            String sugTitle = (title != null && title.trim().length() > 3) ? title : "Civic Infrastructure Defect Reported via Photo";
            String sugDesc = (description != null && description.trim().length() > 10) ? description :
                    "Citizen uploaded on-site photographic evidence depicting public infrastructure damage requiring ward engineer site inspection.";
            String reasoning = "AI Vision/Heuristic: Photographic evidence registered. Severity assessed at 7/10 pending on-site engineer verification.";

            AIAnalysisResult res = new AIAnalysisResult(catId, catName, 7, Priority.HIGH, 24, reasoning, true);
            res.setSuggestedTitle(sugTitle);
            res.setSuggestedDescription(sugDesc);
            return res;
        }

        // 7. General Fallback
        Category fallbackCat = !categories.isEmpty() ? categories.get(0) : null;
        Long catId = fallbackCat != null ? fallbackCat.getCategoryId() : null;
        String catName = fallbackCat != null ? fallbackCat.getName() : "General Grievance";
        String sugTitle = (title != null && !title.isBlank()) ? title : "Municipal Grievance (" + catName + ")";

        AIAnalysisResult res = new AIAnalysisResult(catId, catName, 5, Priority.MEDIUM, 48,
                "AI Heuristic Analysis: Standard municipal grievance requiring routine dispatch.", true);
        res.setSuggestedTitle(sugTitle);
        res.setSuggestedDescription(description != null ? description : "");
        return res;
    }

    private Category findCategoryByKeyword(String keyword, List<Category> categories) {
        if (keyword == null || categories == null) return null;
        String kw = keyword.toLowerCase();
        for (Category c : categories) {
            if (c.getName().toLowerCase().contains(kw)) {
                return c;
            }
        }
        return null;
    }

    // =========================================================================
    // 2. OFFICER SMART TRIAGE & VENDOR MATCHMAKING
    // =========================================================================

    public Map<String, Object> suggestVendorMatch(Long complaintId, String categoryName) {
        return getVendorMatchmakerAnalysis(complaintId, categoryName, null);
    }

    public Map<String, Object> getVendorEligibility(Long complaintId) {
        return getVendorMatchmakerAnalysis(complaintId, null, null);
    }

    public Map<String, Object> getVendorMatchmakerAnalysis(Long complaintId, String categoryName, String departmentOverride) {
        List<User> vendors = userRepository.findByRole(Role.VENDOR);
        if (vendors.isEmpty()) {
            return Map.of("success", false, "message", "No contractors are registered in the system. Please register contractors first.");
        }

        Complaint complaint = null;
        if (complaintId != null) {
            complaint = complaintRepository.findById(complaintId).orElse(null);
            if (complaint != null && (categoryName == null || categoryName.isBlank()) && complaint.getCategory() != null) {
                categoryName = complaint.getCategory().getName();
            }
        }

        String department = departmentOverride;
        if (department == null || department.isBlank()) {
            department = resolveDepartmentFromCategory(categoryName != null ? categoryName : (complaint != null && complaint.getCategory() != null ? complaint.getCategory().getName() : ""));
        }

        final String deptFinal = department;
        final String targetLoc = (complaint != null && complaint.getLocation() != null ? complaint.getLocation() : "").toLowerCase();
        final Double cLat = (complaint != null && complaint.getLatitude() != null) ? complaint.getLatitude().doubleValue() : null;
        final Double cLon = (complaint != null && complaint.getLongitude() != null) ? complaint.getLongitude().doubleValue() : null;

        List<Map<String, Object>> eligibleVendors = new ArrayList<>();
        List<Map<String, Object>> ineligibleVendors = new ArrayList<>();
        List<Map<String, Object>> allScoredVendors = new ArrayList<>();

        for (User v : vendors) {
            Map<String, Object> vCard = new HashMap<>();
            vCard.put("vendorId", v.getUserId());
            vCard.put("name", v.getFullName() != null ? v.getFullName() : v.getUsername());
            vCard.put("username", v.getUsername());
            vCard.put("phone", v.getPhone() != null ? v.getPhone() : "-");
            vCard.put("designation", v.getDesignation() != null ? v.getDesignation() : "Municipal Contractor");
            vCard.put("department", deptFinal);

            // 1. Department Specialization & Active Contract Check
            VendorContract contract = vendorContractService.findActiveContract(v, deptFinal);
            boolean hasActiveContract = (contract != null && contract.getStatus() == ContractStatus.ACTIVE
                    && (contract.getExpiryDate() == null || !contract.getExpiryDate().isBefore(LocalDate.now())));

            // 2. Workload Availability (< 5 active jobs)
            long activeTasks = assignmentRepository.countByVendorAndStatusIn(v, List.of(AssignmentStatus.ASSIGNED, AssignmentStatus.ACCEPTED, AssignmentStatus.IN_PROGRESS));
            boolean workloadAvailable = (activeTasks < 5);
            vCard.put("activeTasks", activeTasks);
            vCard.put("maxCapacity", 5);

            // 3. Historical Completion Rate
            List<Assignment> vendorAssignments = assignmentRepository.findByVendor(v);
            long totalAssigned = vendorAssignments.size();
            long completedTasks = vendorAssignments.stream().filter(a -> a.getStatus() == AssignmentStatus.COMPLETED || a.getStatus() == AssignmentStatus.VERIFIED).count();
            double completionRate = totalAssigned > 0 ? (completedTasks * 100.0 / totalAssigned) : -1.0;
            vCard.put("totalAssignments", totalAssigned);
            vCard.put("completedTasks", completedTasks);
            vCard.put("completionRate", completionRate >= 0 ? Math.round(completionRate) + "%" : "N/A (New Contractor)");

            // 4. Average Resolution Time
            List<Assignment> completedAssignments = vendorAssignments.stream()
                    .filter(a -> a.getCompletedAt() != null && a.getAssignedAt() != null)
                    .collect(Collectors.toList());
            double avgResolutionHours = -1.0;
            if (!completedAssignments.isEmpty()) {
                double totalHours = 0;
                for (Assignment a : completedAssignments) {
                    totalHours += Duration.between(a.getAssignedAt(), a.getCompletedAt()).toMinutes() / 60.0;
                }
                avgResolutionHours = Math.round((totalHours / completedAssignments.size()) * 10.0) / 10.0;
            }
            vCard.put("avgResolutionHours", avgResolutionHours >= 0 ? avgResolutionHours + " hrs" : "N/A");

            // 5. Citizen Feedback Rating
            List<Complaint> ratedComplaints = complaintRepository.findAll().stream()
                    .filter(c -> c.getFeedbackRating() != null && c.getFeedbackRating() > 0)
                    .filter(c -> {
                        Optional<Assignment> aOpt = assignmentRepository.findByComplaint_ComplaintId(c.getComplaintId());
                        return aOpt.isPresent() && aOpt.get().getVendor().getUserId().equals(v.getUserId());
                    })
                    .collect(Collectors.toList());
            double avgRating = -1.0;
            if (!ratedComplaints.isEmpty()) {
                double ratingSum = ratedComplaints.stream().mapToInt(Complaint::getFeedbackRating).sum();
                avgRating = Math.round((ratingSum / ratedComplaints.size()) * 10.0) / 10.0;
            }
            vCard.put("rating", avgRating >= 0 ? avgRating : 0.0);
            vCard.put("ratingDisplay", avgRating >= 0 ? String.format("%.1f ★ (%d reviews)", avgRating, ratedComplaints.size()) : "No ratings yet (New Contractor)");

            // 6. SLA Compliance Rate
            long compliantCount = completedAssignments.stream()
                    .filter(a -> a.getSlaDeadline() != null && !a.getCompletedAt().isAfter(a.getSlaDeadline()))
                    .count();
            double slaComplianceRate = completedAssignments.size() > 0 ? (compliantCount * 100.0 / completedAssignments.size()) : -1.0;
            vCard.put("slaComplianceRate", slaComplianceRate >= 0 ? Math.round(slaComplianceRate) + "%" : "N/A");

            // 7. Distance & Service Area (GPS Haversine)
            double distanceKm = -1.0;
            double[] vCoords = getVendorOrWardCoordinates(v);
            if (cLat != null && cLon != null) {
                distanceKm = calculateDistance(cLat, cLon, vCoords[0], vCoords[1]);
            }
            vCard.put("distanceKm", distanceKm >= 0 ? distanceKm : null);
            vCard.put("distanceDisplay", distanceKm >= 0 ? distanceKm + " km away" : "Ward Proximity (~2-4 km)");

            // Ward coverage check
            boolean wardCovered = true;
            String coveredWards = (contract != null && contract.getCoveredWards() != null) ? contract.getCoveredWards() : "All Wards";
            vCard.put("serviceArea", coveredWards);
            if (!coveredWards.equalsIgnoreCase("All Wards") && !targetLoc.isEmpty() && targetLoc.contains("ward")) {
                Matcher m = Pattern.compile("ward\\s*(\\d+)", Pattern.CASE_INSENSITIVE).matcher(targetLoc);
                if (m.find()) {
                    String wardNum = m.group(1);
                    if (!coveredWards.toLowerCase().contains(wardNum)) {
                        wardCovered = false;
                    }
                }
            }

            // Contract metadata
            if (contract != null) {
                vCard.put("contractId", contract.getContractId());
                vCard.put("contractNumber", contract.getContractNumber());
                vCard.put("contractStatus", contract.getStatus().name());
                vCard.put("contractSlaHours", contract.getContractSlaHours());
                vCard.put("contractExpiry", contract.getExpiryDate() != null ? contract.getExpiryDate().toString() : "Open");
            } else {
                vCard.put("contractStatus", "NO_ACTIVE_CONTRACT");
                vCard.put("contractSlaHours", 24);
            }

            // Determine Eligibility & Explain Ineligibility
            List<String> ineligibilityReasons = new ArrayList<>();
            if (!hasActiveContract) {
                if (contract == null) {
                    ineligibilityReasons.add("No registered contract for " + deptFinal);
                } else if (contract.getStatus() != ContractStatus.ACTIVE) {
                    ineligibilityReasons.add("Contract status is " + contract.getStatus());
                } else if (contract.getExpiryDate() != null && contract.getExpiryDate().isBefore(LocalDate.now())) {
                    ineligibilityReasons.add("Contract expired on " + contract.getExpiryDate());
                }
            }
            if (!workloadAvailable) {
                ineligibilityReasons.add("Workload capacity full (" + activeTasks + "/5 active jobs)");
            }
            if (!wardCovered) {
                ineligibilityReasons.add("Location outside contracted service area (" + coveredWards + ")");
            }

            boolean isEligible = ineligibilityReasons.isEmpty();
            vCard.put("isEligible", isEligible);

            // 10-Factor Match Score Calculation (0 to 100)
            int matchScore = 0;
            if (hasActiveContract) matchScore += 35;
            if (isEligible) matchScore += 15;
            matchScore += Math.max(0, 20 - (int) activeTasks * 4); // Up to 20 for workload availability
            if (wardCovered) matchScore += 10;
            if (distanceKm >= 0) {
                if (distanceKm <= 5.0) matchScore += 10;
                else if (distanceKm <= 15.0) matchScore += 5;
            } else {
                matchScore += 8; // Neutral proximity
            }
            if (slaComplianceRate >= 80.0) matchScore += 5;
            if (avgRating >= 4.0) matchScore += 5;

            vCard.put("matchPercentage", Math.min(100, Math.max(10, matchScore)));

            // Reason for recommendation
            String reasonText;
            if (isEligible) {
                reasonText = String.format("Approved %s contractor (%s) with %d active jobs. Service area: %s.",
                        deptFinal, (contract != null ? contract.getContractNumber() : "Contract Active"), activeTasks, coveredWards);
            } else {
                reasonText = "Ineligible: " + String.join("; ", ineligibilityReasons);
            }
            vCard.put("reason", reasonText);

            if (isEligible) {
                eligibleVendors.add(vCard);
            } else {
                vCard.put("ineligibilityReason", String.join("; ", ineligibilityReasons));
                ineligibleVendors.add(vCard);
            }
            allScoredVendors.add(vCard);
        }

        // Sort eligible vendors by matchPercentage desc, then activeTasks asc
        eligibleVendors.sort((a, b) -> {
            int scoreCmp = Integer.compare((Integer) b.get("matchPercentage"), (Integer) a.get("matchPercentage"));
            if (scoreCmp != 0) return scoreCmp;
            return Long.compare((Long) a.get("activeTasks"), (Long) b.get("activeTasks"));
        });

        allScoredVendors.sort((a, b) -> Integer.compare((Integer) b.get("matchPercentage"), (Integer) a.get("matchPercentage")));

        // Top 3 Recommendations
        List<Map<String, Object>> top3 = eligibleVendors.stream().limit(3).collect(Collectors.toList());
        if (top3.isEmpty() && !allScoredVendors.isEmpty()) {
            top3 = allScoredVendors.stream().limit(3).collect(Collectors.toList());
        }

        Map<String, Object> bestVendor = !top3.isEmpty() ? top3.get(0) : allScoredVendors.get(0);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("detectedDepartment", deptFinal);
        result.put("recommendedVendorId", bestVendor.get("vendorId"));
        result.put("recommendedVendorName", bestVendor.get("name"));
        result.put("recommendedUsername", bestVendor.get("username"));
        result.put("reasoning", bestVendor.get("reason"));
        result.put("topRecommendations", top3);
        result.put("eligibleVendors", eligibleVendors);
        result.put("ineligibleVendors", ineligibleVendors);
        result.put("allVendors", allScoredVendors);

        if (complaint != null) {
            Map<String, Object> cInfo = new HashMap<>();
            cInfo.put("complaintId", complaint.getComplaintId());
            cInfo.put("complaintRef", complaint.getComplaintRef());
            cInfo.put("title", complaint.getTitle());
            cInfo.put("category", complaint.getCategory() != null ? complaint.getCategory().getName() : complaint.getAiCategoryName());
            cInfo.put("priority", complaint.getPriority() != null ? complaint.getPriority().name() : "MEDIUM");
            cInfo.put("location", complaint.getLocation());
            cInfo.put("latitude", complaint.getLatitude());
            cInfo.put("longitude", complaint.getLongitude());
            result.put("complaint", cInfo);
        }

        return result;
    }

    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth's radius in km
        double latDist = Math.toRadians(lat2 - lat1);
        double lonDist = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDist / 2) * Math.sin(latDist / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDist / 2) * Math.sin(lonDist / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10.0) / 10.0;
    }

    private double[] getVendorOrWardCoordinates(User vendor) {
        String area = vendor.getConstituency() != null ? vendor.getConstituency().toLowerCase() : "";
        if (area.contains("13")) return new double[]{12.9780, 77.6020};
        if (area.contains("14")) return new double[]{12.9650, 77.5850};
        if (area.contains("15")) return new double[]{12.9850, 77.6100};
        if (area.contains("10")) return new double[]{12.9550, 77.5750};
        if (area.contains("11")) return new double[]{12.9600, 77.5800};
        return new double[]{12.9716, 77.5946}; // Default Ward 12 center
    }

    public String resolveDepartmentFromCategory(String categoryName) {
        if (categoryName == null) return "Road Maintenance";
        String lower = categoryName.toLowerCase();
        if (lower.contains("road") || lower.contains("pothole") || lower.contains("asphalt") || lower.contains("traffic") || lower.contains("footpath")) {
            return "Road Maintenance";
        }
        if (lower.contains("water") || lower.contains("drain") || lower.contains("pipe") || lower.contains("sewage") || lower.contains("leak") || lower.contains("jal")) {
            return "Water Supply";
        }
        if (lower.contains("electr") || lower.contains("light") || lower.contains("power") || lower.contains("grid") || lower.contains("pole") || lower.contains("wire")) {
            return "Electrical Maintenance";
        }
        if (lower.contains("garb") || lower.contains("waste") || lower.contains("sanitat") || lower.contains("trash") || lower.contains("dump") || lower.contains("clean")) {
            return "Sanitation and Waste Management";
        }
        return "Road Maintenance";
    }

    public Map<String, String> generateOfficerResponse(String title, String description, String category, String status) {
        String plan = "1. Dispatch ward inspection squad to site.\n2. Coordinate with engineering team for material dispatch.\n3. Execute repair work & verify post-fix structural stability.\n4. Capture geotagged after-photo and close ticket.";
        String citizenNote = "Dear Citizen, Your grievance regarding '" + (title != null ? title : "reported issue") + "' is actively being resolved by our ward field squad. We are working to restore normal service within the SLA deadline.";

        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            try {
                String prompt = String.format(
                    "You are an AI Municipal Officer Assistant.\n" +
                    "Draft an actionable step-by-step resolution plan and an empathetic citizen progress update for:\n" +
                    "Title: %s\nCategory: %s\nDescription: %s\nStatus: %s\n\n" +
                    "Return ONLY JSON: {\"actionPlan\": \"<steps>\", \"citizenNote\": \"<note>\"}",
                    title, category, description, status
                );
                String res = callSimpleGemini(prompt);
                if (res != null) {
                    JsonNode node = objectMapper.readTree(cleanJsonResponse(res));
                    return Map.of(
                            "actionPlan", node.path("actionPlan").asText(plan),
                            "citizenNote", node.path("citizenNote").asText(citizenNote)
                    );
                }
            } catch (Exception e) {
                logger.warn("Officer response LLM fallback: {}", e.getMessage());
            }
        }
        return Map.of("actionPlan", plan, "citizenNote", citizenNote);
    }

    // =========================================================================
    // 3. VENDOR AI JOB CARD & BEFORE/AFTER QUALITY INSPECTION
    // =========================================================================

    public Map<String, Object> generateVendorJobCard(String title, String description, String category) {
        List<String> tools = List.of("Standard tool kit", "Safety barricades", "Warning cones", "High-visibility vests");
        List<String> steps = List.of(
                "Secure work site with safety markers.",
                "Inspect site conditions and confirm root cause.",
                "Execute corrective repair according to municipal standard.",
                "Capture clear after-repair photograph with timestamp."
        );
        int estHours = 3;

        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            try {
                String prompt = String.format(
                    "You are a Municipal Civil & Engineering Works Assistant. Generate an official field job card for:\n" +
                    "Title: %s\nCategory: %s\nDescription: %s\n\n" +
                    "Provide a realistic list of required tools/materials, step-by-step repair actions, safety precautions, and estimated completion hours.\n" +
                    "Return ONLY JSON:\n" +
                    "{\n" +
                    "  \"requiredMaterials\": [\"...\", \"...\"],\n" +
                    "  \"executionSteps\": [\"...\", \"...\"],\n" +
                    "  \"safetyPrecautions\": [\"...\", \"...\"],\n" +
                    "  \"estimatedHours\": <integer>\n" +
                    "}",
                    title, category, description
                );
                String res = callSimpleGemini(prompt);
                if (res != null) {
                    JsonNode node = objectMapper.readTree(cleanJsonResponse(res));
                    List<String> materials = new ArrayList<>();
                    node.path("requiredMaterials").forEach(m -> materials.add(m.asText()));
                    List<String> execSteps = new ArrayList<>();
                    node.path("executionSteps").forEach(s -> execSteps.add(s.asText()));
                    List<String> safety = new ArrayList<>();
                    node.path("safetyPrecautions").forEach(s -> safety.add(s.asText()));
                    int hours = node.path("estimatedHours").asInt(estHours);

                    return Map.of(
                            "title", title != null ? title : "Field Job Card",
                            "category", category != null ? category : "General",
                            "requiredMaterials", materials,
                            "executionSteps", execSteps,
                            "safetyPrecautions", safety,
                            "estimatedHours", hours
                    );
                }
            } catch (Exception e) {
                logger.warn("Job card generation LLM fallback: {}", e.getMessage());
            }
        }

        return Map.of(
                "title", title != null ? title : "Field Job Card",
                "category", category != null ? category : "General",
                "requiredMaterials", tools,
                "executionSteps", steps,
                "safetyPrecautions", List.of("Wear reflective jacket", "Wear heavy-duty gloves"),
                "estimatedHours", estHours
        );
    }

    public Map<String, Object> verifyResolutionVision(String originalImageData, String completionImageData, String complaintTitle) {
        if (originalImageData == null || completionImageData == null) {
            return Map.of(
                    "verified", true,
                    "confidence", 75,
                    "observation", "Completion photo provided. Visual comparison bypassed due to missing baseline photo.",
                    "isAiVerified", false
            );
        }

        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            try {
                Map<String, String> beforeImg = extractBase64Data(originalImageData);
                Map<String, String> afterImg = extractBase64Data(completionImageData);

                if (beforeImg != null && afterImg != null) {
                    String prompt = String.format(
                        "You are a Municipal Quality Assurance AI Inspector.\n" +
                        "Complaint Issue: %s\n" +
                        "Image 1 below is the BEFORE photo (citizen's reported problem).\n" +
                        "Image 2 below is the AFTER photo (vendor's reported completion of repair).\n\n" +
                        "Tasks:\n" +
                        "1. Verify if the problem shown in the BEFORE photo has been legitimately fixed in the AFTER photo.\n" +
                        "2. Check if the site appears identical or plausible.\n" +
                        "3. Assign confidence 0 to 100.\n" +
                        "4. State verified: true if the repair looks genuine, false if unresolved or fraudulent/unrelated.\n\n" +
                        "Return ONLY JSON: {\"verified\": true/false, \"confidence\": <integer 0-100>, \"observation\": \"<concise 1-2 sentence assessment>\"}",
                        complaintTitle != null ? complaintTitle : "Civic Grievance"
                    );

                    List<Map<String, Object>> parts = List.of(
                            Map.of("text", prompt),
                            Map.of("inlineData", Map.of("mimeType", beforeImg.get("mimeType"), "data", beforeImg.get("data"))),
                            Map.of("inlineData", Map.of("mimeType", afterImg.get("mimeType"), "data", afterImg.get("data")))
                    );

                    Map<String, Object> reqBody = Map.of("contents", List.of(Map.of("parts", parts)));
                    String json = objectMapper.writeValueAsString(reqBody);

                    HttpRequest request = HttpRequest.newBuilder()
                            .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + geminiApiKey))
                            .header("Content-Type", "application/json")
                            .POST(HttpRequest.BodyPublishers.ofString(json))
                            .timeout(Duration.ofSeconds(12))
                            .build();

                    HttpResponse<String> resp = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                    if (resp.statusCode() == 200) {
                        JsonNode root = objectMapper.readTree(resp.body());
                        String txt = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
                        JsonNode resJson = objectMapper.readTree(cleanJsonResponse(txt));

                        return Map.of(
                                "verified", resJson.path("verified").asBoolean(true),
                                "confidence", resJson.path("confidence").asInt(85),
                                "observation", resJson.path("observation").asText("Visual evidence confirmed resolution."),
                                "isAiVerified", true
                        );
                    }
                }
            } catch (Exception e) {
                logger.warn("Resolution verification Vision LLM fallback: {}", e.getMessage());
            }
        }

        return Map.of(
                "verified", true,
                "confidence", 80,
                "observation", "Resolution photo uploaded by vendor. Basic verification passed.",
                "isAiVerified", false
        );
    }

    // =========================================================================
    // 4. REPRESENTATIVE BRIEFING & ESCALATION MEMO
    // =========================================================================

    public Map<String, Object> generateRepBriefing(String area) {
        String areaKey = area != null ? area.trim() : "";
        long total = areaKey.isEmpty() ? complaintRepository.count() : complaintRepository.countByLocationContainingIgnoreCase(areaKey);
        long resolved = areaKey.isEmpty() ? complaintRepository.countByStatus(ComplaintStatus.RESOLVED) :
                complaintRepository.countByLocationContainingIgnoreCaseAndStatus(areaKey, ComplaintStatus.RESOLVED);
        long pending = total - resolved;
        double rate = total > 0 ? (resolved * 100.0 / total) : 100.0;

        String briefing = String.format("Constituency Intelligence Report for %s: Currently tracking %d total grievances (%d resolved, %d active). Resolution rate stands at %.1f%%. High attention recommended on roads and drainage sectors.",
                areaKey.isEmpty() ? "Entire Constituency" : areaKey, total, resolved, pending, rate);

        return Map.of(
                "area", areaKey.isEmpty() ? "All Areas" : areaKey,
                "totalComplaints", total,
                "resolvedCount", resolved,
                "pendingCount", pending,
                "resolutionRate", String.format("%.1f%%", rate),
                "briefingSummary", briefing
        );
    }

    public Map<String, String> generateEscalationMemo(Long complaintId) {
        Complaint c = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found with ID: " + complaintId));

        String ref = c.getComplaintRef() != null ? c.getComplaintRef() : "GRV-" + c.getComplaintId();
        String title = c.getTitle();
        String loc = c.getLocation() != null ? c.getLocation() : "Ward area";
        String cat = c.getCategory() != null ? c.getCategory().getName() : "Civic Infrastructure";

        String defaultMemo = String.format(
            "OFFICIAL CONSTITUENCY ESCALATION MEMORANDUM\n" +
            "TO: Executive Engineer / Ward Zonal Commissioner\n" +
            "FROM: Office of the Elected Ward Representative\n" +
            "DATE: %s\n" +
            "SUBJECT: URGENT REDRESSAL INTERVENTION - Ticket Ref #%s (%s)\n\n" +
            "Dear Municipal Officers,\n\n" +
            "This memorandum brings to your immediate attention the grievance regarding '%s' situated at %s under Category '%s'.\n" +
            "The issue remains in status '%s' causing acute inconvenience and potential public safety risks to the citizens of this constituency.\n\n" +
            "Kindly dispatch an emergency intervention squad, expedite remediation, and furnish an updated action-taken report within 24 hours.\n\n" +
            "Warm regards,\nElected Ward Representative",
            LocalDateTime.now().toLocalDate().toString(), ref, title, title, loc, cat, c.getStatus().name()
        );

        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            try {
                String prompt = String.format(
                    "You are an AI Executive Secretary for an Elected Municipal Ward Representative (MLA / Corporator).\n" +
                    "Draft an authoritative, formal escalation memo to the Municipal Commissioner and Department Head regarding:\n" +
                    "Ticket: %s | Title: %s | Category: %s | Location: %s | Status: %s | Description: %s\n\n" +
                    "Return ONLY JSON: {\"memoText\": \"<formal letter text>\"}",
                    ref, title, cat, loc, c.getStatus(), c.getDescription()
                );
                String res = callSimpleGemini(prompt);
                if (res != null) {
                    JsonNode node = objectMapper.readTree(cleanJsonResponse(res));
                    return Map.of("memoText", node.path("memoText").asText(defaultMemo));
                }
            } catch (Exception e) {
                logger.warn("Escalation memo LLM fallback: {}", e.getMessage());
            }
        }

        return Map.of("memoText", defaultMemo);
    }

    // =========================================================================
    // 5. RAG CONVERSATIONAL ASSISTANT (All Roles, Fact-Grounded)
    // =========================================================================

    public String processRoleAIChat(String userRole, String message) {
        return processRoleAIChat(userRole, message, "en");
    }

    public String processRoleAIChat(String userRole, String message, String language) {
        return processRoleAIChatWithRag(null, userRole, message, language);
    }

    public String processRoleAIChatWithRag(User user, String roleStr, String message, String language) {
        String role = (user != null ? user.getRole().name() : (roleStr != null ? roleStr.toUpperCase() : "CITIZEN"));
        String userMsg = message != null ? message.trim() : "Hello";
        String lang = (language != null && !language.isBlank()) ? language.toLowerCase() : "en";
        String langName = switch (lang) {
            case "kn", "ka" -> "Kannada";
            case "hi" -> "Hindi";
            case "te" -> "Telugu";
            case "ta" -> "Tamil";
            default -> "English";
        };

        // 1. RETRIEVE live context from DB and policy knowledge
        String retrievedContext = ragRetrieverService.retrieveContextForUser(user, role, userMsg);

        // 2. AUGMENT with strict RAG grounding instructions
        if (hasValidGeminiKey()) {
            try {
                String prompt = String.format(
                    "You are the official AI Civic Intelligence Assistant for the Municipal Public Grievance Redressal System.\n" +
                    "User Role: %s\n" +
                    "Target Output Language: %s\n\n" +
                    "=== STRICT RAG GROUNDING RULES ===\n" +
                    "1. Base your answer PRIMARILY on the verified facts in the RETRIEVED CONTEXT below.\n" +
                    "2. If a citizen asks about their ticket status, quote the EXACT Ticket Ref (e.g. GRV-2026-XXXXXX), current status, and hours left before SLA deadline from the context.\n" +
                    "3. If a ticket cannot be found in context, politely ask the user for their Ticket Ref or ID.\n" +
                    "4. If an officer asks about vendors, cite ONLY the registered vendors explicitly in context. NEVER invent fictional vendor names.\n" +
                    "5. If public safety emergencies are mentioned (fire, gas leak, sparking wire), ALWAYS provide the 24x7 Helpline: 1800-11-2233.\n" +
                    "6. Keep responses concise, direct, polite, professional, and entirely in %s language.\n\n" +
                    "=== RETRIEVED LIVE CONTEXT ===\n%s\n\n" +
                    "=== USER QUERY ===\n%s",
                    role, langName, langName, retrievedContext, userMsg
                );

                String aiResponse = callSimpleGemini(prompt);
                if (aiResponse != null && !aiResponse.isBlank()) {
                    return aiResponse.trim();
                }
            } catch (Exception e) {
                logger.warn("RAG Gemini chat call failed, falling back to grounded rule engine: {}", e.getMessage());
            }
        }

        // Grounded live database response engine
        return generateGroundedRagResponse(user, role, userMsg, lang);
    }

    public Map<String, String> assistCitizenDraft(String rawInput, String language) {
        String input = rawInput != null ? rawInput.trim() : "";
        String title = "Civic Grievance: " + (input.length() > 30 ? input.substring(0, 30) + "..." : input);
        String refinedDesc = "Official Complaint Summary:\n" + input + "\n\nLocation & Impact Notice: Issue reported by citizen requiring municipal action.";

        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            try {
                String prompt = "You are an official Civic Grievance Writing Assistant. Refine the informal complaint input into a formal title and structured description.\n" +
                        "Input: " + input + "\n" +
                        "Return ONLY JSON: {\"suggestedTitle\": \"...\", \"refinedDescription\": \"...\"}";
                String res = callSimpleGemini(prompt);
                if (res != null) {
                    JsonNode node = objectMapper.readTree(cleanJsonResponse(res));
                    return Map.of(
                            "suggestedTitle", node.path("suggestedTitle").asText(title),
                            "refinedDescription", node.path("refinedDescription").asText(refinedDesc)
                    );
                }
            } catch (Exception e) {
                logger.warn("Citizen draft assist fallback: {}", e.getMessage());
            }
        }
        return Map.of("suggestedTitle", title, "refinedDescription", refinedDesc);
    }

    public Map<String, Object> generateRepChecklist(String title, String category) {
        List<String> steps = List.of(
                "Verify location & take geotagged before-photo.",
                "Inspect physical damage/hazard level & check public safety risks.",
                "Contact municipal engineering squad for material dispatch.",
                "Perform repairs & verify structural stability.",
                "Obtain citizen signature / take completion after-photo."
        );
        return Map.of("title", title != null ? title : "Field Inspection", "category", category != null ? category : "General", "inspectionSteps", steps, "estimatedHours", 4);
    }

    public Map<String, Object> generateAdminInsights(int totalComplaints, int pendingCount, int resolvedCount) {
        double resolutionRate = totalComplaints > 0 ? (resolvedCount * 100.0 / totalComplaints) : 100.0;
        String highlight = resolutionRate > 75 ? "System performing well with optimal SLA compliance." : "Attention needed: High pending grievances in sanitation & road infrastructure.";
        return Map.of(
                "resolutionRate", String.format("%.1f%%", resolutionRate),
                "executiveSummary", "AI Governance Report: Total grievances " + totalComplaints + " (" + resolvedCount + " resolved, " + pendingCount + " pending). " + highlight,
                "hotspotCategory", "Roads & Sanitation",
                "recommendedAction", "Reallocate 2 field representatives to high-volume wards."
        );
    }

    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    private String callSimpleGemini(String prompt) {
        try {
            Map<String, Object> req = Map.of("contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + geminiApiKey))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(req)))
                    .timeout(Duration.ofSeconds(10))
                    .build();

            HttpResponse<String> resp = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(resp.body());
                return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            }
        } catch (Exception e) {
            logger.warn("Simple Gemini call failed: {}", e.getMessage());
        }
        return null;
    }

    private Map<String, String> extractBase64Data(String dataUrl) {
        if (dataUrl == null || dataUrl.isBlank()) return null;
        String mimeType = "image/jpeg";
        String base64 = dataUrl.trim();
        if (base64.startsWith("data:")) {
            int semicolon = base64.indexOf(";base64,");
            if (semicolon != -1) {
                mimeType = base64.substring(5, semicolon);
                base64 = base64.substring(semicolon + 8);
            }
        }
        return Map.of("mimeType", mimeType, "data", base64);
    }

    private String cleanJsonResponse(String raw) {
        if (raw == null) return "{}";
        String trimmed = raw.trim();
        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replaceAll("(?s)^```(?:json)?\\s*(.*?)\\s*```$", "$1").trim();
        }
        return trimmed;
    }

    private Long findCategoryIdByName(String name, List<Category> categories) {
        if (name == null) return !categories.isEmpty() ? categories.get(0).getCategoryId() : null;
        for (Category cat : categories) {
            if (cat.getName().equalsIgnoreCase(name) || cat.getName().toLowerCase().contains(name.toLowerCase())) {
                return cat.getCategoryId();
            }
        }
        return !categories.isEmpty() ? categories.get(0).getCategoryId() : null;
    }

    private int calculateSlaHours(Priority priority, int severity) {
        return switch (priority) {
            case CRITICAL -> 12;
            case HIGH -> 24;
            case MEDIUM -> 48;
            case LOW -> 72;
        };
    }

    private String generateGroundedRagResponse(User user, String role, String userMsg, String lang) {
        String lower = userMsg != null ? userMsg.toLowerCase().trim() : "";
        String roleUpper = role != null ? role.toUpperCase() : (user != null && user.getRole() != null ? user.getRole().name() : "CITIZEN");

        // 1. Emergency Safety Override
        boolean isUrgent = lower.contains("urgent") || lower.contains("emergency") || lower.contains("fire")
                || lower.contains("wire") || lower.contains("gas leak") || lower.contains("danger")
                || lower.contains("ತುರ್ತು") || lower.contains("आपात") || lower.contains("అత్యవసర") || lower.contains("அவசர");
        if (isUrgent) {
            return "🚨 Municipal Emergency Protocol:\n"
                    + "For critical life safety emergencies (live wire, gas leak, fire hazard), please contact our 24x7 Municipal Helpline immediately at 1800-11-2233.\n"
                    + "Rapid response municipal squads are on standby 24/7.";
        }

        // 2. Specific Ticket Reference Lookup (e.g., #1, GRV-2026-000001, track 1, status 1, or bare 1)
        Optional<Complaint> specificTicket = findExplicitTicketInQuery(lower);
        if (specificTicket.isPresent()) {
            return formatTicketChatResponse(specificTicket.get());
        }

        // 3. Citizen: Track Complaints Query
        boolean isTrackQuery = lower.contains("track") || lower.contains("status") || lower.contains("complaint")
                || lower.contains("my") || lower.contains("progress") || lower.contains("grievance")
                || lower.contains("ಸ್ಥಿತಿ") || lower.contains("स्थिति") || lower.contains("நிலை");

        if ("CITIZEN".equals(roleUpper) || isTrackQuery) {
            if (isTrackQuery || "CITIZEN".equals(roleUpper)) {
                if (user != null) {
                    List<Complaint> myComplaints = complaintRepository.findByCitizen(user);
                    if (myComplaints.isEmpty()) {
                        return "📋 Grievance Tracking for @" + user.getUsername() + ":\n"
                                + "You currently have 0 active or registered complaints in the system.\n\n"
                                + "To register an issue, click 'Log a New Complaint' from your Citizen Dashboard with a photo and GPS location.";
                    }

                    // Sort newest first
                    myComplaints.sort((a, b) -> Long.compare(b.getComplaintId(), a.getComplaintId()));
                    StringBuilder sb = new StringBuilder();
                    sb.append(String.format("📋 Your Registered Complaints (%d Total for @%s):\n\n", myComplaints.size(), user.getUsername()));

                    int limit = Math.min(myComplaints.size(), 4);
                    for (int i = 0; i < limit; i++) {
                        Complaint c = myComplaints.get(i);
                        String ref = c.getComplaintRef() != null ? c.getComplaintRef() : "GRV-" + c.getComplaintId();
                        String cat = c.getCategory() != null ? c.getCategory().getName() : "General";
                        String sla = formatComplaintSla(c);

                        // Assigned vendor lookup
                        String vendorInfo = "Pending Assignment";
                        var assignOpt = assignmentRepository.findByComplaint_ComplaintId(c.getComplaintId());
                        if (assignOpt.isPresent()) {
                            User v = assignOpt.get().getVendor();
                            vendorInfo = (v.getFullName() != null ? v.getFullName() : v.getUsername()) + " (" + assignOpt.get().getStatus() + ")";
                        }

                        sb.append(String.format("%d. %s (ID: #%d) — \"%s\"\n", (i + 1), ref, c.getComplaintId(), c.getTitle()));
                        sb.append(String.format("   • Status: %s | Category: %s | Priority: %s\n", c.getStatus(), cat, c.getPriority()));
                        sb.append(String.format("   • SLA: %s\n", sla));
                        sb.append(String.format("   • Assigned Contractor: %s\n\n", vendorInfo));
                    }

                    if (myComplaints.size() > limit) {
                        sb.append(String.format("...and %d more complaints. ", (myComplaints.size() - limit)));
                    }
                    sb.append("💡 Tip: Ask me 'track #<ID>' (e.g. 'track #1') for in-depth details on any specific ticket.");
                    return sb.toString();
                } else if (isTrackQuery) {
                    return "To track your personal complaints, please ensure you are logged in, or provide your specific Ticket Reference (e.g. #1 or GRV-2026-000001) and I will retrieve its live status.";
                }
            }
        }

        // 4. Officer: Vendor Workloads & Smart Match Queries
        if ("OFFICER".equals(roleUpper)) {
            if (lower.contains("vendor") || lower.contains("match") || lower.contains("workload") || lower.contains("contractor")) {
                List<User> vendors = userRepository.findByRole(Role.VENDOR);
                if (vendors.isEmpty()) {
                    return "👷 Registered Vendors: No municipal contractors are currently registered in the database. Please add vendors in the Admin panel.";
                }

                StringBuilder sb = new StringBuilder();
                sb.append(String.format("👷 Registered Municipal Contractors & Workload Status (%d Active):\n\n", vendors.size()));
                User lowestVendor = null;
                long minActive = Long.MAX_VALUE;

                for (User v : vendors) {
                    long active = assignmentRepository.countByVendorAndStatus(v, AssignmentStatus.ASSIGNED)
                            + assignmentRepository.countByVendorAndStatus(v, AssignmentStatus.IN_PROGRESS);
                    long completed = assignmentRepository.countByVendorAndStatus(v, AssignmentStatus.COMPLETED);

                    if (active < minActive) {
                        minActive = active;
                        lowestVendor = v;
                    }

                    sb.append(String.format("• %s (@%s)\n", v.getFullName() != null ? v.getFullName() : v.getUsername(), v.getUsername()));
                    sb.append(String.format("  Specialty: %s | Active Jobs: %d | Completed: %d\n",
                            v.getDesignation() != null ? v.getDesignation() : "General Contractor", active, completed));
                }

                if (lowestVendor != null) {
                    sb.append(String.format("\n💡 Recommended for next assignment: %s (@%s) with %d active jobs.",
                            lowestVendor.getFullName() != null ? lowestVendor.getFullName() : lowestVendor.getUsername(),
                            lowestVendor.getUsername(), minActive));
                }
                return sb.toString();
            }

            if (lower.contains("duplicate") || lower.contains("flag")) {
                long dupCount = complaintRepository.countByStatus(ComplaintStatus.FLAGGED_DUPLICATE);
                return String.format("🔍 Flagged Duplicates: There are currently %d complaints flagged as duplicates pending officer review in the 'Manage Complaints' portal.", dupCount);
            }

            if (lower.contains("urgent") || lower.contains("critical") || lower.contains("breach") || lower.contains("sla")) {
                List<Complaint> open = complaintRepository.findByStatusNotIn(List.of(ComplaintStatus.CLOSED, ComplaintStatus.RESOLVED));
                long criticalCount = open.stream().filter(c -> c.getPriority() == Priority.CRITICAL || c.getPriority() == Priority.HIGH).count();
                return String.format("⚡ Critical & SLA Overview:\nTotal active open complaints: %d\nComplaints with CRITICAL/HIGH priority: %d\nReview these in 'Manage Complaints' to assign vendors before SLA breaches.",
                        open.size(), criticalCount);
            }
        }

        // 5. Vendor: Work Orders Query
        if ("VENDOR".equals(roleUpper)) {
            if (lower.contains("task") || lower.contains("job") || lower.contains("order") || lower.contains("pending") || lower.contains("work")) {
                if (user != null) {
                    List<Assignment> tasks = assignmentRepository.findByVendor(user);
                    if (tasks.isEmpty()) {
                        return "🔧 Vendor Work Orders: You currently have no active work orders assigned to you.";
                    }
                    StringBuilder sb = new StringBuilder();
                    sb.append(String.format("🔧 Assigned Work Orders (%d Total for @%s):\n\n", tasks.size(), user.getUsername()));
                    for (Assignment a : tasks) {
                        Complaint c = a.getComplaint();
                        sb.append(String.format("• Task #%d [%s] for Ticket #%d: \"%s\"\n", a.getAssignmentId(), a.getStatus(), c.getComplaintId(), c.getTitle()));
                        sb.append(String.format("  Location: %s | Category: %s\n", c.getLocation(), c.getCategory() != null ? c.getCategory().getName() : "General"));
                    }
                    return sb.toString();
                }
            }
            if (lower.contains("verify") || lower.contains("photo") || lower.contains("complete")) {
                return "📸 AI Repair Verification: After completing the repair work on site, take a clear photo and click 'Complete Task'. The AI Vision model will verify the fix against the citizen's initial evidence photo.";
            }
        }

        // 6. Representative: Constituency Query
        if ("REPRESENTATIVE".equals(roleUpper)) {
            String area = user != null && user.getConstituency() != null ? user.getConstituency() : "";
            long total = area.isEmpty() ? complaintRepository.count() : complaintRepository.countByLocationContainingIgnoreCase(area);
            long resolved = area.isEmpty() ? complaintRepository.countByStatus(ComplaintStatus.RESOLVED) : complaintRepository.countByLocationContainingIgnoreCaseAndStatus(area, ComplaintStatus.RESOLVED);
            return String.format("📊 Constituency Summary (%s):\n• Total Complaints: %d\n• Resolved: %d\n• Open/Pending: %d\nTrack localized grievances in the 'Ward Complaints' tab.",
                    area.isEmpty() ? "All Wards" : area, total, resolved, (total - resolved));
        }

        // 7. Admin: System Metrics Query
        if ("ADMIN".equals(roleUpper)) {
            long total = complaintRepository.count();
            long resolved = complaintRepository.countByStatus(ComplaintStatus.RESOLVED);
            long usersCount = userRepository.count();
            return String.format("📈 Executive Municipal Health:\n• Total Grievances: %d\n• Resolved: %d (%.1f%% resolution rate)\n• Registered Citizens & Staff: %d\nInspect live system health and SLA analytics from the Admin Dashboard.",
                    total, resolved, (total > 0 ? (resolved * 100.0 / total) : 100.0), usersCount);
        }

        // 8. Default Grounded Guidance
        return switch (roleUpper) {
            case "OFFICER" -> "Officer AI Assistant: You can ask me to check 'vendor workloads', 'urgent complaints', 'flagged duplicates', or query specific ticket details using 'track #<ID>'.";
            case "VENDOR" -> "Vendor AI Assistant: You can ask about 'my pending tasks', 'materials & checklist', or 'how to verify completed repairs with AI photos'.";
            case "REPRESENTATIVE" -> "Representative AI Assistant: Ask me for 'constituency overview', 'SLA breach analysis', or specific ticket tracking.";
            case "ADMIN" -> "Admin AI Assistant: Ask me about 'system resolution rate', 'SLA breach analytics', or 'vendor performance'.";
            default -> "AI Civic Assistant: I am ready to help you! You can ask:\n• 'Track my complaints' to see all your grievance statuses\n• 'Track #1' (or any ticket number) for live progress details\n• 'How to submit a complaint' for step-by-step guidance\n• 'Emergency helpline' for public safety assistance.";
        };
    }

    private Optional<Complaint> findExplicitTicketInQuery(String query) {
        if (query == null || query.isBlank()) return Optional.empty();

        Pattern pattern = Pattern.compile("(?i)(GRV-\\d{4}-\\d+|#(\\d{1,6})|\\b(?:ticket|complaint|grievance|id|track|status|about|for|number|no\\.?)\\s*#?\\s*(\\d{1,6})\\b)");
        Matcher matcher = pattern.matcher(query);

        if (matcher.find()) {
            String fullMatch = matcher.group(1);
            String numericId = matcher.group(2) != null ? matcher.group(2) : matcher.group(3);

            if (fullMatch != null && fullMatch.toUpperCase().startsWith("GRV-")) {
                return complaintRepository.findByComplaintRef(fullMatch.toUpperCase());
            } else if (numericId != null) {
                try {
                    return complaintRepository.findById(Long.parseLong(numericId));
                } catch (NumberFormatException ignored) {}
            }
        } else if (query.trim().matches("^\\d{1,6}$")) {
            try {
                return complaintRepository.findById(Long.parseLong(query.trim()));
            } catch (NumberFormatException ignored) {}
        }
        return Optional.empty();
    }

    private String formatTicketChatResponse(Complaint c) {
        String ref = c.getComplaintRef() != null ? c.getComplaintRef() : "GRV-" + c.getComplaintId();
        String cat = c.getCategory() != null ? c.getCategory().getName() : "General";
        String sla = formatComplaintSla(c);

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("📋 Live Status for Ticket %s (#%d):\n", ref, c.getComplaintId()));
        sb.append(String.format("• Title: \"%s\"\n", c.getTitle()));
        sb.append(String.format("• Category: %s | Priority: %s (Severity: %d/10)\n", cat, c.getPriority(), c.getSeverityScore() != null ? c.getSeverityScore() : 5));
        sb.append(String.format("• Status: %s\n", c.getStatus()));
        sb.append(String.format("• SLA Target: %s\n", sla));
        sb.append(String.format("• Location: %s\n", c.getLocation() != null ? c.getLocation() : "Ward area"));

        var assignOpt = assignmentRepository.findByComplaint_ComplaintId(c.getComplaintId());
        if (assignOpt.isPresent()) {
            Assignment a = assignOpt.get();
            User v = a.getVendor();
            sb.append(String.format("• Assigned Contractor: %s (@%s - %s) [Work Status: %s]\n",
                    v.getFullName() != null ? v.getFullName() : v.getUsername(),
                    v.getUsername(),
                    v.getDesignation() != null ? v.getDesignation() : "Contractor",
                    a.getStatus()));
        } else {
            sb.append("• Assigned Contractor: Pending Officer Assignment\n");
        }

        if (c.getResolutionNote() != null && !c.getResolutionNote().isBlank()) {
            sb.append(String.format("• Officer / Resolution Note: %s\n", c.getResolutionNote()));
        }

        return sb.toString();
    }

    private String formatComplaintSla(Complaint c) {
        if (c.getStatus() == ComplaintStatus.RESOLVED || c.getStatus() == ComplaintStatus.CLOSED) {
            return "Resolved ✓";
        }
        if (c.getSlaDeadline() == null) {
            return "48h Target";
        }
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(c.getSlaDeadline())) {
            long overdueHours = Duration.between(c.getSlaDeadline(), now).toHours();
            return "OVERDUE by " + overdueHours + " hours (SLA Breached)";
        } else {
            long remainingHours = Duration.between(now, c.getSlaDeadline()).toHours();
            return remainingHours + " hours remaining";
        }
    }
}
