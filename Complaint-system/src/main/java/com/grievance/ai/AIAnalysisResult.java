package com.grievance.ai;

public record AIAnalysisResult(
        String detectedLanguage,
        String translatedText,
        String category,
        int severity,
        String summary
) {}
