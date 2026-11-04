package com.grievance.ai;

public record DuplicateCheckResult(
        boolean isDuplicate,
        int matchedIndex,
        int confidence
) {}
