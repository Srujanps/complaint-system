package com.grievance.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AIAssistantService {

    private static final Logger log = LoggerFactory.getLogger(AIAssistantService.class);

    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public AIAssistantService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public AIAssistantService(RestTemplate restTemplate, ObjectMapper objectMapper, String apiKey) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
    }

    /**
     * Combined Language Detection + Translation + Auto-Categorization + Severity Scoring.
     */
    public AIAnalysisResult analyzeComplaint(String title, String description) {
        String combinedInput = (title != null ? title : "") + " - " + (description != null ? description : "");

        String prompt = "You are an AI assistant for a civic grievance management system.\n" +
                "Analyze the following complaint input (which may be in English, Hindi, Kannada, or mixed language):\n" +
                "\"" + combinedInput + "\"\n\n" +
                "Perform the following tasks:\n" +
                "1. Detect the input language (ISO 639-1 code: en, hi, kn, or 'other').\n" +
                "2. Translate the full text to English if not already in English.\n" +
                "3. Categorize the issue into EXACTLY ONE of: 'Road Damage', 'Garbage', 'Water Supply', 'Drainage', 'Street Lights', 'Other'.\n" +
                "4. Score severity on an integer scale of 1 to 10 (1 = low impact, 10 = critical emergency).\n" +
                "5. Provide a concise 1-line summary in English.\n\n" +
                "Return ONLY a valid JSON object without markdown formatting or code blocks. Format:\n" +
                "{\n" +
                "  \"detectedLanguage\": \"<en/hi/kn/other>\",\n" +
                "  \"translatedText\": \"<English translation>\",\n" +
                "  \"category\": \"<one of specified categories>\",\n" +
                "  \"severity\": <integer 1-10>,\n" +
                "  \"summary\": \"<one line summary>\"\n" +
                "}";

        try {
            String rawJson = callGeminiApi(prompt);
            String cleanedJson = cleanJsonResponse(rawJson);
            JsonNode node = objectMapper.readTree(cleanedJson);

            String detectedLanguage = node.path("detectedLanguage").asText("unknown");
            String translatedText = node.path("translatedText").asText(combinedInput);
            String category = node.path("category").asText("Other");
            int severity = node.path("severity").asInt(5);
            String summary = node.path("summary").asText("Complaint registered");

            log.info("AI Analysis successful. Language: {}, Category: {}, Severity: {}", detectedLanguage, category, severity);
            return new AIAnalysisResult(detectedLanguage, translatedText, category, severity, summary);

        } catch (Exception e) {
            log.error("AI Analysis failed for input: {}. Returning default fallback.", combinedInput, e);
            return new AIAnalysisResult("unknown", combinedInput, "Other", 5, "Default summary (API unavailable)");
        }
    }

    /**
     * Compare new complaint text against nearby open complaints for duplicates.
     */
    public DuplicateCheckResult checkDuplicate(String newComplaintText, List<String> nearbyComplaintTexts) {
        if (nearbyComplaintTexts == null || nearbyComplaintTexts.isEmpty()) {
            return new DuplicateCheckResult(false, -1, 0);
        }

        StringBuilder nearbyListBuilder = new StringBuilder();
        for (int i = 0; i < nearbyComplaintTexts.size(); i++) {
            nearbyListBuilder.append("[").append(i).append("] ").append(nearbyComplaintTexts.get(i)).append("\n");
        }

        String prompt = "Compare the NEW complaint text against the list of NEARBY open complaints below:\n\n" +
                "NEW COMPLAINT:\n\"" + newComplaintText + "\"\n\n" +
                "NEARBY COMPLAINTS:\n" + nearbyListBuilder.toString() + "\n" +
                "Determine if the new complaint describes the EXACT SAME physical incident or problem as any of the nearby complaints.\n" +
                "Return ONLY a valid JSON object without markdown formatting:\n" +
                "{\n" +
                "  \"isDuplicate\": true/false,\n" +
                "  \"matchedIndex\": <0-based index of matched complaint, or -1 if none>,\n" +
                "  \"confidence\": <integer confidence score 0 to 100>\n" +
                "}";

        try {
            String rawJson = callGeminiApi(prompt);
            String cleanedJson = cleanJsonResponse(rawJson);
            JsonNode node = objectMapper.readTree(cleanedJson);

            boolean isDuplicate = node.path("isDuplicate").asBoolean(false);
            int matchedIndex = node.path("matchedIndex").asInt(-1);
            int confidence = node.path("confidence").asInt(0);

            log.info("Duplicate check completed. Duplicate: {}, Confidence: {}, Index: {}", isDuplicate, confidence, matchedIndex);

            // Flag only if confidence > 70
            boolean validDuplicate = isDuplicate && (confidence > 70);
            return new DuplicateCheckResult(validDuplicate, matchedIndex, confidence);

        } catch (Exception e) {
            log.error("Duplicate check call failed. Proceeding without duplicate flag.", e);
            return new DuplicateCheckResult(false, -1, 0);
        }
    }

    /**
     * Translates response text back to citizen's native language if required.
     */
    public String translateText(String text, String targetLanguage) {
        if (targetLanguage == null || targetLanguage.equalsIgnoreCase("en") || targetLanguage.equalsIgnoreCase("unknown")) {
            return text;
        }

        String prompt = "Translate the following text to ISO language code '" + targetLanguage + "'.\n" +
                "Text: \"" + text + "\"\n" +
                "Return ONLY a JSON object: {\"translatedText\": \"...\"}";

        try {
            String rawJson = callGeminiApi(prompt);
            String cleanedJson = cleanJsonResponse(rawJson);
            JsonNode node = objectMapper.readTree(cleanedJson);
            return node.path("translatedText").asText(text);
        } catch (Exception e) {
            log.error("Translation back to {} failed.", targetLanguage, e);
            return text;
        }
    }

    private String callGeminiApi(String promptText) throws Exception {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Gemini API key is not configured");
        }
        String url = GEMINI_URL + apiKey;

        Map<String, Object> textPart = Map.of("text", promptText);
        Map<String, Object> partsObj = Map.of("parts", List.of(textPart));
        Map<String, Object> requestBody = Map.of("contents", List.of(partsObj));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode rootNode = objectMapper.readTree(response.getBody());
            JsonNode candidates = rootNode.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                return candidates.get(0).path("content").path("parts").get(0).path("text").asText();
            }
        }
        throw new RuntimeException("Gemini API call failed with status: " + response.getStatusCode());
    }

    private String cleanJsonResponse(String raw) {
        if (raw == null) return "{}";
        String trimmed = raw.trim();
        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replaceAll("(?s)^```(?:json)?\\s*(.*?)\\s*```$", "$1").trim();
        }
        return trimmed;
    }
}
