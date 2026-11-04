package com.grievance.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class AIAssistantServiceTest {

    private RestTemplate restTemplate;
    private MockRestServiceServer mockServer;
    private AIAssistantService aiAssistantService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        restTemplate = new RestTemplate();
        mockServer = MockRestServiceServer.createServer(restTemplate);
        objectMapper = new ObjectMapper();
        aiAssistantService = new AIAssistantService(restTemplate, objectMapper, "test-api-key");
    }

    @Test
    void testAnalyzeComplaint_Success() {
        String mockGeminiResponse = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          {
                            "text": "```json\\n{\\n  \\"detectedLanguage\\": \\"kn\\",\\n  \\"translatedText\\": \\"Pothole on main road\\",\\n  \\"category\\": \\"Road Damage\\",\\n  \\"severity\\": 8,\\n  \\"summary\\": \\"Severe pothole on main road\\"\\n}\\n```"
                          }
                        ]
                      }
                    }
                  ]
                }
                """;

        mockServer.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=test-api-key"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(mockGeminiResponse, MediaType.APPLICATION_JSON));

        AIAnalysisResult result = aiAssistantService.analyzeComplaint("ರಸ್ತೆಯಲ್ಲಿ ಗುಂಡಿ ಬಿದ್ದಿದೆ", "Main road pothole");

        assertNotNull(result);
        assertEquals("kn", result.detectedLanguage());
        assertEquals("Pothole on main road", result.translatedText());
        assertEquals("Road Damage", result.category());
        assertEquals(8, result.severity());
        assertEquals("Severe pothole on main road", result.summary());

        mockServer.verify();
    }

    @Test
    void testCheckDuplicate_Success_Flagged() {
        String mockGeminiResponse = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          {
                            "text": "{\\"isDuplicate\\": true, \\"matchedIndex\\": 0, \\"confidence\\": 85}"
                          }
                        ]
                      }
                    }
                  ]
                }
                """;

        mockServer.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=test-api-key"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(mockGeminiResponse, MediaType.APPLICATION_JSON));

        DuplicateCheckResult result = aiAssistantService.checkDuplicate(
                "Large hole on MG Road",
                List.of("Deep pothole causing traffic on MG Road")
        );

        assertNotNull(result);
        assertTrue(result.isDuplicate());
        assertEquals(0, result.matchedIndex());
        assertEquals(85, result.confidence());

        mockServer.verify();
    }

    @Test
    void testAnalyzeComplaint_ApiFailure_ReturnsFallback() {
        mockServer.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=test-api-key"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withServerError());

        AIAnalysisResult result = aiAssistantService.analyzeComplaint("Broken pipe", "Water leaking");

        assertNotNull(result);
        assertEquals("unknown", result.detectedLanguage());
        assertEquals("Other", result.category());
        assertEquals(5, result.severity());
    }
}
