package com.project.Complaint.system.service;

import com.project.Complaint.system.model.EmailTemplate;
import com.project.Complaint.system.repository.EmailTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class EmailTemplateService implements CommandLineRunner {

    @Autowired
    private EmailTemplateRepository templateRepository;

    @Override
    public void run(String... args) throws Exception {
        initDefaultTemplates();
    }

    public void initDefaultTemplates() {
        createDefaultIfMissing("VERIFY_EMAIL", "Email Verification",
                "Verify your email address - AI Public Grievance Portal",
                """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                  <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 24px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 24px;">AI Public Grievance Portal</h1>
                    <p style="margin: 6px 0 0 0; opacity: 0.9;">Citizen Email Verification</p>
                  </div>
                  <div style="padding: 24px; color: #1e293b;">
                    <p>Hello <strong>{CITIZEN_NAME}</strong>,</p>
                    <p>Thank you for registering on the AI Public Grievance Portal. Please verify your email address to activate your account and start filing civic complaints.</p>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="{VERIFICATION_LINK}" style="background-color: #2563eb; color: white; padding: 14px 28px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block;">VERIFY EMAIL ADDRESS</a>
                    </div>
                    <p style="font-size: 13px; color: #64748b;">If the button does not work, copy and paste this URL into your browser:<br/><a href="{VERIFICATION_LINK}" style="color: #2563eb;">{VERIFICATION_LINK}</a></p>
                  </div>
                </div>
                """,
                "Hello {CITIZEN_NAME}, Please verify your email address by visiting: {VERIFICATION_LINK}");

        createDefaultIfMissing("WELCOME", "Welcome Email",
                "Welcome to the AI Public Grievance Portal",
                """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                  <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 24px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 24px;">Welcome to Smart Civic Governance</h1>
                  </div>
                  <div style="padding: 24px; color: #1e293b;">
                    <p>Dear <strong>{CITIZEN_NAME}</strong>,</p>
                    <p>Your citizen account has been successfully verified and activated on the <strong>AI-Driven Public Grievance Management System</strong>.</p>
                    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px;">
                      <h4 style="margin: 0 0 8px 0; color: #1e3a8a;">Account Details</h4>
                      <p style="margin: 4px 0;"><strong>Name:</strong> {CITIZEN_NAME}</p>
                      <p style="margin: 4px 0;"><strong>Email:</strong> {CITIZEN_EMAIL}</p>
                      <p style="margin: 4px 0;"><strong>Status:</strong> Active & Verified</p>
                    </div>
                    <p>You can now submit complaints, upload photo evidence, track live progress with SLA timers, and receive automatic status updates directly in your preferred language.</p>
                    <div style="text-align: center; margin: 28px 0;">
                      <a href="{DASHBOARD_LINK}" style="background-color: #0f172a; color: white; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">GO TO CITIZEN DASHBOARD</a>
                    </div>
                  </div>
                </div>
                """,
                "Dear {CITIZEN_NAME}, Welcome to the AI Public Grievance Portal. Access your dashboard: {DASHBOARD_LINK}");

        createDefaultIfMissing("COMPLAINT_REGISTERED", "Complaint Registered",
                "Complaint Registered Successfully – {COMPLAINT_REF}",
                """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden;">
                  <div style="background: #0284c7; padding: 20px; color: white; text-align: center;">
                    <h2 style="margin: 0;">Complaint Registered Successfully</h2>
                    <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: bold;">{COMPLAINT_REF}</p>
                  </div>
                  <div style="padding: 24px; color: #334155;">
                    <p>Dear <strong>{CITIZEN_NAME}</strong>,</p>
                    <p>Your complaint has been successfully recorded in our system and forwarded for AI analysis and department assignment.</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8fafc; border-radius: 8px;">
                      <tr><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Complaint ID:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">{COMPLAINT_REF}</td></tr>
                      <tr><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Category:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">{CATEGORY_NAME}</td></tr>
                      <tr><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Submission Date:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">{SUBMISSION_DATE}</td></tr>
                      <tr><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">General Location:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">{LOCATION}</td></tr>
                      <tr><td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Current Status:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><span style="background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 12px; font-weight: bold;">{CURRENT_STATUS}</span></td></tr>
                      <tr><td style="padding: 10px; font-weight: bold;">Priority / Expected SLA:</td><td style="padding: 10px;">{PRIORITY} ({SLA_DATE})</td></tr>
                    </table>
                    <div style="text-align: center; margin: 24px 0;">
                      <a href="{TRACK_LINK}" style="background-color: #0284c7; color: white; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">TRACK COMPLAINT</a>
                    </div>
                  </div>
                </div>
                """,
                "Dear {CITIZEN_NAME}, Your complaint {COMPLAINT_REF} was registered successfully with status {CURRENT_STATUS}. Track here: {TRACK_LINK}");

        createDefaultIfMissing("STATUS_UPDATE", "Complaint Status Update",
                "Complaint Update – {COMPLAINT_REF}",
                """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden;">
                  <div style="background: #1e293b; padding: 20px; color: white;">
                    <h2 style="margin: 0;">Complaint Status Update</h2>
                    <p style="margin: 4px 0 0 0; font-size: 16px; color: #94a3b8;">Complaint ID: {COMPLAINT_REF}</p>
                  </div>
                  <div style="padding: 24px; color: #334155;">
                    <p>Dear <strong>{CITIZEN_NAME}</strong>,</p>
                    <p>There is a status update on your reported issue: <strong>{COMPLAINT_TITLE}</strong>.</p>
                    <div style="display: flex; gap: 10px; margin: 20px 0; padding: 16px; background: #f1f5f9; border-radius: 8px; align-items: center;">
                      <div style="flex: 1; text-align: center;">
                        <span style="display: block; font-size: 12px; color: #64748b; font-weight: bold;">PREVIOUS STATUS</span>
                        <span style="font-size: 14px; font-weight: bold; color: #475569;">{PREVIOUS_STATUS}</span>
                      </div>
                      <div style="font-size: 20px; color: #94a3b8;">➔</div>
                      <div style="flex: 1; text-align: center;">
                        <span style="display: block; font-size: 12px; color: #0284c7; font-weight: bold;">CURRENT STATUS</span>
                        <span style="font-size: 16px; font-weight: bold; color: #0284c7;">{CURRENT_STATUS}</span>
                      </div>
                    </div>
                    <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 14px; border-radius: 6px; margin-bottom: 20px;">
                      <strong style="color: #0f172a;">Official Update Note:</strong>
                      <p style="margin: 6px 0 0 0; color: #334155; font-style: italic;">"{OFFICIAL_NOTE}"</p>
                      <span style="display: block; font-size: 12px; color: #94a3b8; margin-top: 8px;">Last Updated: {UPDATED_AT}</span>
                    </div>
                    <div style="text-align: center; margin: 24px 0;">
                      <a href="{TRACK_LINK}" style="background-color: #2563eb; color: white; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">TRACK COMPLAINT</a>
                    </div>
                  </div>
                </div>
                """,
                "Dear {CITIZEN_NAME}, Complaint {COMPLAINT_REF} status changed from {PREVIOUS_STATUS} to {CURRENT_STATUS}. Note: {OFFICIAL_NOTE}. Track: {TRACK_LINK}");

        createDefaultIfMissing("RESOLVED", "Final Resolution Email",
                "Your Complaint Has Been Resolved – {COMPLAINT_REF}",
                """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden;">
                  <div style="background: #16a34a; padding: 22px; color: white; text-align: center;">
                    <h2 style="margin: 0;">Complaint Resolved</h2>
                    <p style="margin: 4px 0 0 0; font-size: 16px;">Complaint ID: {COMPLAINT_REF}</p>
                  </div>
                  <div style="padding: 24px; color: #334155;">
                    <p>Dear <strong>{CITIZEN_NAME}</strong>,</p>
                    <p>Your complaint regarding <strong>{CATEGORY_NAME}</strong> has been inspected and verified as <strong>RESOLVED</strong> by the designated officer.</p>
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                      <h4 style="margin: 0 0 8px 0; color: #15803d;">Resolution Summary</h4>
                      <p style="margin: 4px 0;"><strong>Resolution Date:</strong> {RESOLUTION_DATE}</p>
                      <p style="margin: 4px 0;"><strong>Official Resolution Note:</strong> {RESOLUTION_NOTE}</p>
                    </div>
                    <p style="font-weight: bold; text-align: center;">Please review the resolution and let us know whether your issue was actually fixed:</p>
                    <div style="text-align: center; margin: 24px 0;">
                      <a href="{VIEW_LINK}" style="background-color: #0f172a; color: white; padding: 12px 20px; font-weight: bold; text-decoration: none; border-radius: 6px; margin: 4px; display: inline-block;">[VIEW RESOLUTION]</a>
                      <a href="{SOLVED_LINK}" style="background-color: #16a34a; color: white; padding: 12px 20px; font-weight: bold; text-decoration: none; border-radius: 6px; margin: 4px; display: inline-block;">[PROBLEM SOLVED]</a>
                      <a href="{NOT_SOLVED_LINK}" style="background-color: #dc2626; color: white; padding: 12px 20px; font-weight: bold; text-decoration: none; border-radius: 6px; margin: 4px; display: inline-block;">[PROBLEM NOT SOLVED]</a>
                    </div>
                  </div>
                </div>
                """,
                "Dear {CITIZEN_NAME}, Complaint {COMPLAINT_REF} is resolved. Review & confirm here: {VIEW_LINK}");

        createDefaultIfMissing("SLA_WARNING", "SLA Warning Email",
                "⚠ Complaint Resolution Deadline Approaching – {COMPLAINT_REF}",
                """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #fde047; border-radius: 12px; overflow: hidden;">
                  <div style="background: #eab308; padding: 20px; color: #422006; text-align: center;">
                    <h2 style="margin: 0;">⚠ SLA Deadline Approaching</h2>
                    <p style="margin: 4px 0 0 0; font-weight: bold;">Complaint ID: {COMPLAINT_REF}</p>
                  </div>
                  <div style="padding: 24px; color: #334155;">
                    <p>Dear <strong>{CITIZEN_NAME}</strong>,</p>
                    <p>Your complaint is actively being processed. Our SLA monitoring engine has flagged this issue as approaching its expected deadline.</p>
                    <div style="background: #fefce8; border-left: 4px solid #eab308; padding: 16px; margin: 20px 0;">
                      <p style="margin: 4px 0;"><strong>Current Status:</strong> {CURRENT_STATUS}</p>
                      <p style="margin: 4px 0;"><strong>Expected Resolution:</strong> {EXPECTED_SLA_DATE}</p>
                      <p style="margin: 4px 0;"><strong>Remaining Time:</strong> {REMAINING_TIME}</p>
                      <p style="margin: 4px 0;"><strong>Assigned Authority:</strong> {ASSIGNED_DEPARTMENT}</p>
                    </div>
                    <div style="text-align: center; margin: 20px 0;">
                      <a href="{TRACK_LINK}" style="background-color: #ca8a04; color: white; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">TRACK PROGRESS</a>
                    </div>
                  </div>
                </div>
                """,
                "Dear {CITIZEN_NAME}, Complaint {COMPLAINT_REF} is approaching SLA deadline on {EXPECTED_SLA_DATE}. Status: {CURRENT_STATUS}");

        createDefaultIfMissing("SLA_BREACH", "SLA Breach Email",
                "⚠ Complaint Resolution Delayed – {COMPLAINT_REF}",
                """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #fca5a5; border-radius: 12px; overflow: hidden;">
                  <div style="background: #dc2626; padding: 20px; color: white; text-align: center;">
                    <h2 style="margin: 0;">⚠ Complaint Resolution Delayed</h2>
                    <p style="margin: 4px 0 0 0; font-weight: bold;">Complaint ID: {COMPLAINT_REF}</p>
                  </div>
                  <div style="padding: 24px; color: #334155;">
                    <p>Dear <strong>{CITIZEN_NAME}</strong>,</p>
                    <p>We apologize for the delay. Your complaint has exceeded its target SLA resolution deadline and has been automatically escalated to senior department officers for immediate action.</p>
                    <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0;">
                      <p style="margin: 4px 0;"><strong>Current Status:</strong> <span style="color: #dc2626; font-weight: bold;">ESCALATED</span></p>
                      <p style="margin: 4px 0;"><strong>Original Target Date:</strong> {EXPECTED_SLA_DATE}</p>
                      <p style="margin: 4px 0;"><strong>Delay Duration:</strong> {DELAY_DURATION}</p>
                    </div>
                    <div style="text-align: center; margin: 20px 0;">
                      <a href="{TRACK_LINK}" style="background-color: #dc2626; color: white; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">VIEW ESCALATED STATUS</a>
                    </div>
                  </div>
                </div>
                """,
                "Dear {CITIZEN_NAME}, Complaint {COMPLAINT_REF} SLA deadline exceeded by {DELAY_DURATION} and has been ESCALATED.");

        createDefaultIfMissing("DUPLICATE_ALERT", "Duplicate Complaint Alert",
                "Possible Related Complaint Found – {COMPLAINT_REF}",
                """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden;">
                  <div style="background: #d97706; padding: 20px; color: white; text-align: center;">
                    <h2 style="margin: 0;">Possible Related Complaint Found</h2>
                    <p style="margin: 4px 0 0 0;">Complaint ID: {COMPLAINT_REF}</p>
                  </div>
                  <div style="padding: 24px; color: #334155;">
                    <p>Dear <strong>{CITIZEN_NAME}</strong>,</p>
                    <p>Our AI system detected that a very similar civic problem was recently reported in your immediate location.</p>
                    <div style="background: #fffbeeb; border-left: 4px solid #d97706; padding: 16px; margin: 20px 0;">
                      <p style="margin: 4px 0;"><strong>Existing Complaint Reference:</strong> {EXISTING_COMPLAINT_REF}</p>
                      <p style="margin: 4px 0;"><strong>Related Issue Status:</strong> {EXISTING_STATUS}</p>
                      <p style="margin: 4px 0;"><strong>Similarity Score:</strong> {SIMILARITY_SCORE}%</p>
                    </div>
                    <p>Your complaint remains recorded in our system. You can choose to track the ongoing resolution of the existing issue or keep your complaint as a distinct report.</p>
                    <div style="text-align: center; margin: 20px 0;">
                      <a href="{TRACK_LINK}" style="background-color: #d97706; color: white; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">REVIEW COMPLAINT DETAILS</a>
                    </div>
                  </div>
                </div>
                """,
                "Dear {CITIZEN_NAME}, A similar issue {EXISTING_COMPLAINT_REF} was detected near your report {COMPLAINT_REF}. Track here: {TRACK_LINK}");
    }

    private void createDefaultIfMissing(String code, String name, String subject, String html, String text) {
        Optional<EmailTemplate> existing = templateRepository.findByTemplateCode(code);
        if (existing.isEmpty()) {
            EmailTemplate tmpl = new EmailTemplate();
            tmpl.setTemplateCode(code);
            tmpl.setName(name);
            tmpl.setSubjectTemplate(subject);
            tmpl.setBodyTemplateHtml(html);
            tmpl.setBodyTemplateText(text);
            tmpl.setLanguage("EN");
            templateRepository.save(tmpl);
        }
    }

    public EmailTemplate getTemplate(String code, String language) {
        return templateRepository.findByTemplateCodeAndLanguage(code, language != null ? language : "EN")
                .orElseGet(() -> templateRepository.findByTemplateCode(code)
                        .orElseThrow(() -> new RuntimeException("Template not found for code: " + code)));
    }

    public String interpolate(String templateStr, Map<String, String> values) {
        if (templateStr == null) return "";
        String result = templateStr;
        for (Map.Entry<String, String> entry : values.entrySet()) {
            String placeholder = "{" + entry.getKey() + "}";
            result = result.replace(placeholder, entry.getValue() != null ? entry.getValue() : "");
        }
        return result;
    }
}
