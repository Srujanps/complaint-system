package com.project.Complaint.system.service;

import com.project.Complaint.system.model.ComplaintStatus;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class TranslationService {

    private final Map<String, Map<String, String>> dictionary = new HashMap<>();

    public TranslationService() {
        initDictionary();
    }

    private void initDictionary() {
        // Status translations
        addTranslation("STATUS_RECEIVED", "EN", "RECEIVED");
        addTranslation("STATUS_RECEIVED", "KA", "ಸ್ವೀಕರಿಸಲಾಗಿದೆ (RECEIVED)");
        addTranslation("STATUS_RECEIVED", "HI", "प्राप्त हुआ (RECEIVED)");
        addTranslation("STATUS_RECEIVED", "TE", "స్వీకరించబడింది (RECEIVED)");
        addTranslation("STATUS_RECEIVED", "TA", "பெறப்பட்டது (RECEIVED)");
        addTranslation("STATUS_RECEIVED", "ML", "സ്വീകരിച്ചു (RECEIVED)");
        addTranslation("STATUS_RECEIVED", "MR", "प्राप्त झाले (RECEIVED)");

        addTranslation("STATUS_OFFICER_REVIEW", "EN", "OFFICER_REVIEW");
        addTranslation("STATUS_OFFICER_REVIEW", "KA", "ಅಧಿಕಾರಿ ಪರಿಶೀಲನೆ (OFFICER_REVIEW)");
        addTranslation("STATUS_OFFICER_REVIEW", "HI", "अधिकारी समीक्षा (OFFICER_REVIEW)");

        addTranslation("STATUS_ASSIGNED", "EN", "ASSIGNED");
        addTranslation("STATUS_ASSIGNED", "KA", "ನಿಯೋಜಿಸಲಾಗಿದೆ (ASSIGNED)");
        addTranslation("STATUS_ASSIGNED", "HI", "आवंटित (ASSIGNED)");
        addTranslation("STATUS_ASSIGNED", "TE", "కేటాయించబడింది (ASSIGNED)");

        addTranslation("STATUS_VENDOR_ACCEPTED", "EN", "VENDOR_ACCEPTED");
        addTranslation("STATUS_VENDOR_ACCEPTED", "KA", "ವೇಂಡರ್ ಒಪ್ಪಿಕೊಂಡಿದ್ದಾರೆ (VENDOR_ACCEPTED)");

        addTranslation("STATUS_IN_PROGRESS", "EN", "IN_PROGRESS");
        addTranslation("STATUS_IN_PROGRESS", "KA", "ಕಾಮಗಾರಿ ಪ್ರಗತಿಯಲ್ಲಿದೆ (IN_PROGRESS)");
        addTranslation("STATUS_IN_PROGRESS", "HI", "कार्य प्रगति पर है (IN_PROGRESS)");
        addTranslation("STATUS_IN_PROGRESS", "TE", "పని పురోగతిలో ఉంది (IN_PROGRESS)");

        addTranslation("STATUS_COMPLETED", "EN", "COMPLETED");
        addTranslation("STATUS_COMPLETED", "KA", "ಕಾಮಗಾರಿ ಪೂರ್ಣಗೊಂಡಿದೆ (COMPLETED)");
        addTranslation("STATUS_COMPLETED", "HI", "कार्य पूर्ण हुआ (COMPLETED)");

        addTranslation("STATUS_OFFICER_VERIFICATION", "EN", "OFFICER_VERIFICATION");
        addTranslation("STATUS_OFFICER_VERIFICATION", "KA", "ಅಧಿಕಾರಿ ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ (OFFICER_VERIFICATION)");

        addTranslation("STATUS_RESOLVED", "EN", "RESOLVED");
        addTranslation("STATUS_RESOLVED", "KA", "ಪರಿಹರಿಸಲಾಗಿದೆ (RESOLVED)");
        addTranslation("STATUS_RESOLVED", "HI", "निवारण हो गया (RESOLVED)");
        addTranslation("STATUS_RESOLVED", "TE", "పరిష్కరించబడింది (RESOLVED)");

        addTranslation("STATUS_PENDING", "EN", "PENDING");
        addTranslation("STATUS_PENDING", "KA", "ಬಾಕಿ ಉಳಿದಿದೆ (PENDING)");

        addTranslation("STATUS_DUPLICATE", "EN", "DUPLICATE");
        addTranslation("STATUS_DUPLICATE", "KA", "ನಕಲಿ ದೂರು (DUPLICATE)");

        addTranslation("STATUS_ESCALATED", "EN", "ESCALATED");
        addTranslation("STATUS_ESCALATED", "KA", "ಉನ್ನತಾಧಿಕಾರಿಗೆ ವಹಿಸಲಾಗಿದೆ (ESCALATED)");

        addTranslation("STATUS_REOPENED", "EN", "REOPENED");
        addTranslation("STATUS_REOPENED", "KA", "ಮರುಪರಿಶೀಲನೆಗೆ ತೆರೆಯಲಾಗಿದೆ (REOPENED)");

        addTranslation("STATUS_REJECTED", "EN", "REJECTED");
        addTranslation("STATUS_REJECTED", "KA", "ತಿರಸ್ಕರಿಸಲಾಗಿದೆ (REJECTED)");

        // Common email strings
        addTranslation("VERIFY_SUBJECT", "EN", "Verify your email address - AI Grievance Portal");
        addTranslation("VERIFY_SUBJECT", "KA", "ನಿಮ್ಮ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ಪರಿಶೀಲಿಸಿ - AI ಕುರಿಗಳ ದೂರು ಪೋರ್ಟಲ್");

        addTranslation("WELCOME_SUBJECT", "EN", "Welcome to the AI Public Grievance Portal");
        addTranslation("WELCOME_SUBJECT", "KA", "AI ಸಾರ್ವಜನಿಕ ಕುಂದುಕೊರತೆ ಪೋರ್ಟಲ್‌ಗೆ ಸುಸ್ವಾಗತ");

        addTranslation("REGISTERED_SUBJECT", "EN", "Complaint Registered Successfully – ");
        addTranslation("REGISTERED_SUBJECT", "KA", "ದೂರು ಯಶಸ್ವಿಯಾಗಿ ನೋಂದಾಯಿಸಲ್ಪಟ್ಟಿದೆ – ");

        addTranslation("STATUS_UPDATE_SUBJECT", "EN", "Complaint Status Update – ");
        addTranslation("STATUS_UPDATE_SUBJECT", "KA", "ದೂರಿನ ಸ್ಥಿತಿ ನವೀಕರಣ – ");

        addTranslation("RESOLVED_SUBJECT", "EN", "Your Complaint Has Been Resolved – ");
        addTranslation("RESOLVED_SUBJECT", "KA", "ನಿಮ್ಮ ದೂರು ಪರಿಹರಿಸಲ್ಪಟ್ಟಿದೆ – ");

        addTranslation("SLA_WARNING_SUBJECT", "EN", "⚠ Complaint Resolution Deadline Approaching – ");
        addTranslation("SLA_WARNING_SUBJECT", "KA", "⚠ ದೂರು ಪರಿಹಾರದ ಗಡುವು ಹತ್ತಿರದಲ್ಲಿದೆ – ");

        addTranslation("SLA_BREACH_SUBJECT", "EN", "⚠ Complaint Resolution Delayed – ");
        addTranslation("SLA_BREACH_SUBJECT", "KA", "⚠ ದೂರು ಪರಿಹಾರ ವಿಳಂಬವಾಗಿದೆ – ");

        addTranslation("DUPLICATE_SUBJECT", "EN", "Possible Related Complaint Found – ");
        addTranslation("DUPLICATE_SUBJECT", "KA", "ಸಾಧ್ಯವಿರುವ ಸಂಬಂಧಿತ ದೂರು ಕಂಡುಬಂದಿದೆ – ");
    }

    private void addTranslation(String key, String lang, String value) {
        dictionary.computeIfAbsent(key.toUpperCase(), k -> new HashMap<>()).put(lang.toUpperCase(), value);
    }

    public String translateStatus(ComplaintStatus status, String language) {
        if (status == null) return "";
        String langKey = language != null ? language.toUpperCase() : "EN";
        String key = "STATUS_" + status.name();
        Map<String, String> langMap = dictionary.get(key);
        if (langMap != null && langMap.containsKey(langKey)) {
            return langMap.get(langKey);
        }
        return status.name();
    }

    public String translate(String key, String language) {
        String langKey = language != null ? language.toUpperCase() : "EN";
        Map<String, String> langMap = dictionary.get(key.toUpperCase());
        if (langMap != null) {
            if (langMap.containsKey(langKey)) {
                return langMap.get(langKey);
            }
            if (langMap.containsKey("EN")) {
                return langMap.get("EN");
            }
        }
        return key;
    }
}
