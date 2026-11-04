/**
 * Multilingual Internationalization (i18n) Engine with Instant Embedded Fallbacks
 * Supports 5 languages: English (en), Kannada (kn), Hindi (hi), Telugu (te), Tamil (ta)
 * Works flawlessly on file:/// protocol, local HTTP, and production servers.
 */

const EMBEDDED_I18N = {
  en: {
    "nav_portal_title": "Grievance Hub",
    "nav_dashboard": "Dashboard",
    "nav_admin_tools": "Admin Tools",
    "nav_complaints": "Complaints",
    "nav_log_complaint": "Log a Complaint",
    "nav_my_complaints": "Track My Complaints",
    "nav_officer_tools": "Officer Tools",
    "nav_assign_complaints": "Assign Complaints",
    "nav_vendor_tasks": "Vendor Tasks",
    "nav_my_tasks": "My Assigned Tasks",
    "nav_rep_tools": "Representative Tools",
    "nav_area_complaints": "Area Complaints",
    "nav_manage_users": "Manage Users",
    "nav_manage_categories": "Manage Categories",
    "nav_email_logs": "Email Notification Logs",
    "nav_logout": "Logout",
    "nav_welcome": "Welcome",

    "login_header": "Sign In to Your Account",
    "login_subtitle": "Access civic grievance portal services & track status",
    "username_label": "Username",
    "username_placeholder": "Enter username",
    "password_label": "Password",
    "password_placeholder": "••••••••",
    "login_button": "Log In",
    "no_account_text": "Don't have an account?",
    "sign_up_link": "Register / Sign Up",

    "signup_header": "Create Your Account",
    "signup_subtitle": "Join the smart civic grievance redressal network",
    "full_name_label": "Full Name",
    "email_label": "Email Address",
    "phone_label": "Phone Number",
    "role_label": "Role",
    "preferred_lang_label": "Preferred Language",
    "signup_button": "Sign Up",
    "already_account_text": "Already have an account?",

    "submit_header": "Log a New Complaint",
    "submit_subtitle": "Please provide accurate details so your issue can be resolved quickly.",
    "submit_title_label": "Title",
    "submit_title_placeholder": "Brief title of the issue",
    "submit_category_label": "Category",
    "submit_category_auto": "✨ Auto-Detect Category with AI",
    "submit_desc_label": "Description",
    "submit_desc_placeholder": "Describe the issue in detail — what, where, when…",
    "submit_refine_ai": "Refine with AI",
    "submit_ai_triage_title": "AI Smart Triage Preview",
    "submit_location_label": "📍 Location",
    "submit_use_location_btn": "Use my current location",
    "submit_evidence_label": "Evidence Photo",
    "submit_btn": "Submit Complaint",
    "location_auto_sub": "We'll auto-fill your area address",
    "or_manual_location": "Or enter your location manually",
    "landmark_label": "Add a specific landmark or address detail",
    "open_camera_btn": "Open Camera",
    "upload_photo_btn": "Upload Photo",
    "camera_help_text": "Capture a photo on the spot or upload an existing image.",

    "dashboard_title": "Dashboard",
    "dashboard_welcome": "Welcome to your grievance management overview.",
    "stat_total": "Total Complaints",
    "stat_pending": "Pending Complaints",
    "stat_resolved": "Resolved Complaints",
    "stat_escalated": "Escalated Complaints",

    "my_complaints_title": "Citizen Grievance Dashboard",
    "my_complaints_subtitle": "Track applications, view status notifications, and manage preferences.",
    "report_new_problem": "+ Report New Problem",
    "tab_applications": "MY APPLICATIONS / COMPLAINTS",
    "tab_recent_notifications": "Recent Notifications",
    "tab_preferences": "Notification Preferences",
    "tab_history": "Notification History",

    "problem_solved_btn": "Problem Solved",
    "problem_not_solved_btn": "Problem Not Solved",
    "was_issue_solved": "Was your issue actually solved?",
    "official_resolution_note": "Official Resolution Note:",

    "officer_assign_title": "Assign Complaints",
    "rep_area_title": "Area Complaints",
    "vendor_tasks_title": "My Assigned Tasks",
    "admin_users_title": "System Users",
    "admin_categories_title": "Grievance Categories",
    "admin_email_logs_title": "Admin Email Logs & System Alerts",

    "chatbot_title": "AI Civic Assistant",
    "chatbot_online": "Online | Govt Grievance Bot",
    "chatbot_greeting": "Namaste! I am your AI Civic Assistant. How can I guide you today?",
    "chatbot_chip_file": "📝 File Complaint",
    "chatbot_chip_track": "⏱️ Track Status",
    "chatbot_chip_helpline": "📞 Helpline 1800-11-2233",
    "chatbot_placeholder": "Type your query...",
    "chatbot_thinking": "AI Assistant is thinking...",

    "btn_refresh": "Refresh",
    "btn_refresh_logs": "Refresh Logs",
    "my_complaints_list_title": "My Complaints List",
    "th_complaint_id": "Complaint ID",
    "th_title_category": "Title & Category",
    "th_status": "Status",
    "th_last_update": "Last Update",
    "th_sla_target": "SLA Target",
    "th_action": "Action",
    "th_ticket_id": "Ticket ID",
    "th_issue_details": "Issue Details",
    "th_category": "Category",
    "th_location": "Location (Lat/Long)",
    "th_name": "Name",
    "th_email": "Email",
    "th_phone": "Phone",
    "th_role": "Role",
    "th_cat_name": "Category Name",
    "th_priority": "Default Priority",
    "th_sla_hours": "SLA (Hours)",
    "th_sent_time": "Sent Time",
    "th_recipient": "Recipient",
    "th_delivery_status": "Delivery Status",
    "active_complaints_title": "Active Public Complaints",
    "btn_all_complaints": "All Complaints",
    "btn_flagged_duplicates": "Flagged Duplicates",
    "btn_add_user": "Add User",
    "btn_add_category": "Add Category",
    "all_registered_users": "All Registered Users",
    "all_categories": "All Categories",
    "audit_log_title": "System Email Audit Log",
    "filter_all": "All",
    "filter_submitted": "Submitted",
    "filter_assigned": "Assigned",
    "filter_in_progress": "In Progress",
    "filter_resolved": "Resolved",
    "filter_escalated": "Escalated",
    "filter_closed": "Closed",
    "card_log_new_title": "Log a New Complaint",
    "card_log_new_sub": "Report a civic issue in your area. Use GPS to auto-fill location.",
    "card_log_new_btn": "Get Started",
    "card_view_complaints_title": "View My Complaints",
    "card_view_complaints_sub": "Track progress and resolution status of your submitted issues.",
    "card_view_complaints_btn": "View History",
    "btn_cancel": "Cancel",
    "btn_update": "Update",
    "btn_assign": "Assign",
    "btn_track": "Track",
    "btn_view_resolution": "View Resolution",
    "home_portal_title": "AI-Driven Public Grievance Management System",
    "home_tagline": "YOUR VOICE, OUR DUTY",
    "home_dept_login": "Department Login",
    "home_hero_badge": "Civic Grievance Services",
    "home_hero_title": "File a Grievance Here",
    "home_hero_subtitle": "Related to Municipal & Government Departments",
    "home_hero_desc": "Register civic complaints directly to municipal authorities. Powered by automated AI classification, instant location verification, and strict SLA timelines monitored for prompt on-ground action.",
    "home_file_btn": "File a Grievance",
    "home_register_btn": "Citizen Registration",
    "home_track_title": "Track Your Grievance",
    "home_track_placeholder": "e.g. GRV-2026-000001",
    "home_track_btn": "Track Status",
    "home_stats_title": "Live Grievance Redressal Statistics",
    "home_stat_total": "Total Registered",
    "home_stat_pending": "Pending Review",
    "home_stat_ongoing": "In Progress",
    "home_stat_resolved": "Resolved",
    "home_stat_rate": "Resolution Rate",
    "home_services_title": "Civic Service Categories",
    "home_services_subtitle": "Select a category to report local civic issues to the appropriate municipal department",
    "home_cat_road": "Roads & Footpaths",
    "home_cat_road_desc": "Potholes, surface damage, cratered streets, broken pavements",
    "home_cat_water": "Water Supply",
    "home_cat_water_desc": "Pipeline bursts, drinking water contamination, low pressure, supply disruption",
    "home_cat_drain": "Drainage & Sewerage",
    "home_cat_drain_desc": "Open drain overflow, clogged gutters, manhole blockages, water stagnation",
    "home_cat_garbage": "Solid Waste & Sanitation",
    "home_cat_garbage_desc": "Uncollected garbage heaps, public littering, black spots, sweep requests",
    "home_cat_light": "Street Lighting",
    "home_cat_light_desc": "Defective luminaires, dark spots, damaged electrical poles, open cables",
    "home_how_title": "How It Works",
    "home_how_subtitle": "Four simple steps from complaint filing to verified civic resolution",
    "home_step1_title": "1. Report Issue",
    "home_step1_desc": "Upload grievance photograph with automatic GPS location tagging.",
    "home_step2_title": "2. AI Smart Triage",
    "home_step2_desc": "AI categorizes the complaint and assigns SLA to the local ward officer.",
    "home_step3_title": "3. Contractor Execution",
    "home_step3_desc": "Empaneled vendors perform repairs and upload before-and-after proof.",
    "home_step4_title": "4. Citizen Verification",
    "home_step4_desc": "Ward officer conducts QA and citizen confirms resolution with feedback.",
    "home_helpline_title": "24x7 Citizen Helpline & Support",
    "home_helpline_tollfree": "Toll-Free: 1902 / 1800-425-0000",
    "home_helpline_email": "grievances@karnataka.gov.in",
    "home_helpline_sub": "Available round-the-clock for civic grievance assistance across all municipal wards."
  },

  kn: {
    "nav_portal_title": "ಕುಂದುಕೊರತೆ ಹಬ್",
    "nav_dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "nav_admin_tools": "ನಿರ್ವಾಹಕ ಪರಿಕರಗಳು",
    "nav_complaints": "ದೂರುಗಳು",
    "nav_log_complaint": "ದೂರು ಸಲ್ಲಿಸಿ",
    "nav_my_complaints": "ನನ್ನ ದೂರುಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
    "nav_officer_tools": "ಅಧಿಕಾರಿ ಪರಿಕರಗಳು",
    "nav_assign_complaints": "ದೂರುಗಳನ್ನು ನಿಯೋಜಿಸಿ",
    "nav_vendor_tasks": "ವೆಂಡರ್ ಕಾರ್ಯಗಳು",
    "nav_my_tasks": "ನನ್ನ ನಿಯೋಜಿತ ಕಾರ್ಯಗಳು",
    "nav_rep_tools": "ಪ್ರತಿನಿಧಿ ಪರಿಕರಗಳು",
    "nav_area_complaints": "ಕ್ಷೇತ್ರ ದೂರುಗಳು",
    "nav_manage_users": "ಬಳಕೆದಾರರ ನಿರ್ವಹಣೆ",
    "nav_manage_categories": "ವರ್ಗಗಳ ನಿರ್ವಹಣೆ",
    "nav_email_logs": "ಇಮೇಲ್ ಅಧಿಸೂಚನೆ ಲಾಗ್‌ಗಳು",
    "nav_logout": "ನಿರ್ಗಮನ (ಲಾಗ್‌ಔಟ್)",
    "nav_welcome": "ಸ್ವಾಗತ",

    "login_header": "ನಿಮ್ಮ ಖಾತೆಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ",
    "login_subtitle": "ನಾಗರಿಕ ಕುಂದುಕೊರತೆ ಸೇವೆಗಳನ್ನು ಪ್ರವೇಶಿಸಿ ಮತ್ತು ಸ್ಥಿತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
    "username_label": "ಬಳಕೆದಾರ ಹೆಸರು",
    "username_placeholder": "ಬಳಕೆದಾರ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
    "password_label": "ಪಾಸ್‌ವರ್ಡ್",
    "password_placeholder": "••••••••",
    "login_button": "ಲಾಗಿನ್ ಮಾಡಿ",
    "no_account_text": "ಖಾತೆ ಇಲ್ಲವೇ?",
    "sign_up_link": "ನೋಂದಾಯಿಸಿ / ಸೈನ್ ಅಪ್ ಮಾಡಿ",

    "signup_header": "ನಿಮ್ಮ ಖಾತೆಯನ್ನು ರಚಿಸಿ",
    "signup_subtitle": "ಸ್ಮಾರ್ಟ್ ನಾಗರಿಕ ಕುಂದುಕೊರತೆ ಪರಿಹಾರ ನೆಟ್‌ವರ್ಕ್‌ಗೆ ಸೇರಿ",
    "full_name_label": "ಪೂರ್ಣ ಹೆಸರು",
    "email_label": "ಇಮೇಲ್ ವಿಳಾಸ",
    "phone_label": "ದೂರವಾಣಿ ಸಂಖ್ಯೆ",
    "role_label": "ಪಾತ್ರ",
    "preferred_lang_label": "ಆದ್ಯತೆಯ ಭಾಷೆ",
    "signup_button": "ಸೈನ್ ಅಪ್ ಮಾಡಿ",
    "already_account_text": "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?",

    "submit_header": "ಹೊಸ ದೂರು ಸಲ್ಲಿಸಿ",
    "submit_subtitle": "ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ತ್ವರಿತವಾಗಿ ಪರಿಹರಿಸಲು ಸರಿಯಾದ ವಿವರಗಳನ್ನು ಒದಗಿಸಿ.",
    "submit_title_label": "ಶೀರ್ಷಿಕೆ",
    "submit_title_placeholder": "ಸಮಸ್ಯೆಯ ಸಂಕ್ಷಿಪ್ತ ಶೀರ್ಷಿಕೆ",
    "submit_category_label": "ವರ್ಗ",
    "submit_category_auto": "✨ AI ಮೂಲಕ ವರ್ಗ ಪತ್ತೆಹಚ್ಚಿ",
    "submit_desc_label": "ವಿವರಣೆ",
    "submit_desc_placeholder": "ಸಮಸ್ಯೆಯನ್ನು ವಿವರವಾಗಿ ವಿವರಿಸಿ — ಏನು, ಎಲ್ಲಿ, ಯಾವಾಗ…",
    "submit_refine_ai": "AI ಯೊಂದಿಗೆ ಸುಧಾರಿಸಿ",
    "submit_ai_triage_title": "AI ಸ್ಮಾರ್ಟ್ ವಿಶ್ಲೇಷಣೆ ಮುನ್ನೋಟ",
    "submit_location_label": "📍 ಸ್ಥಳ",
    "submit_use_location_btn": "ನನ್ನ ಪ್ರಸ್ತುತ ಸ್ಥಳವನ್ನು ಬಳಸಿ",
    "submit_evidence_label": "ಸಾಕ್ಷ್ಯಾಧಾರ ಫೋಟೋ",
    "submit_btn": "ದೂರು ಸಲ್ಲಿಸಿ",
    "location_auto_sub": "ನಾವು ನಿಮ್ಮ ಪ್ರದೇಶದ ವಿಳಾಸವನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ತುಂಬುತ್ತೇವೆ",
    "or_manual_location": "ಅಥವಾ ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಹಸ್ತಚಾಲಿತವಾಗಿ ನಮೂದಿಸಿ",
    "landmark_label": "ನಿರ್ದಿಷ್ಟ ಹೆಗ್ಗುರುತು ಅಥವಾ ವಿಳಾಸ ವಿವರವನ್ನು ಸೇರಿಸಿ",
    "open_camera_btn": "ಕ್ಯಾಮೆರಾ ತೆರೆಯಿರಿ",
    "upload_photo_btn": "ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    "camera_help_text": "ತಕ್ಷಣ ಫೋಟೋ ತೆಗೆಯಿರಿ ಅಥವಾ ಅಸ್ತಿತ್ವದಲ್ಲಿರುವ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",

    "dashboard_title": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "dashboard_welcome": "ನಿಮ್ಮ ಕುಂದುಕೊರತೆ ನಿರ್ವಹಣಾ ಅವಲೋಕನಕ್ಕೆ ಸುಸ್ವಾಗತ.",
    "stat_total": "ಒಟ್ಟು ದೂರುಗಳು",
    "stat_pending": "ಬಾಕಿ ಇರುವ ದೂರುಗಳು",
    "stat_resolved": "ಪರಿಹರಿಸಲಾದ ದೂರುಗಳು",
    "stat_escalated": "ಉಲ್ಬಣಗೊಂಡ ದೂರುಗಳು",

    "my_complaints_title": "ನಾಗರಿಕ ಕುಂದುಕೊರತೆ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "my_complaints_subtitle": "ಅರ್ಜಿಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ, ಸ್ಥಿತಿ ಅಧಿಸೂಚನೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ಆದ್ಯತೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ.",
    "report_new_problem": "+ ಹೊಸ ಸಮಸ್ಯೆಯನ್ನು ವರದಿ ಮಾಡಿ",
    "tab_applications": "ನನ್ನ ಅರ್ಜಿಗಳು / ದೂರುಗಳು",
    "tab_recent_notifications": "ಇತ್ತೀಚಿನ ಅಧಿಸೂಚನೆಗಳು",
    "tab_preferences": "ಅಧಿಸೂಚನೆ ಆದ್ಯತೆಗಳು",
    "tab_history": "ಅಧಿಸೂಚನೆ ಇತಿಹಾಸ",

    "problem_solved_btn": "ಸಮಸ್ಯೆ ಪರಿಹಾರವಾಗಿದೆ",
    "problem_not_solved_btn": "ಸಮಸ್ಯೆ ಪರಿಹಾರವಾಗಿಲ್ಲ",
    "was_issue_solved": "ನಿಮ್ಮ ಸಮಸ್ಯೆ ನಿಜವಾಗಿಯೂ ಪರಿಹಾರವಾಗಿದೆಯೇ?",
    "official_resolution_note": "ಅಧಿಕೃತ ಪರಿಹಾರ ಟಿಪ್ಪಣಿ:",

    "officer_assign_title": "ದೂರುಗಳನ್ನು ನಿಯೋಜಿಸಿ",
    "rep_area_title": "ಕ್ಷೇತ್ರ ದೂರುಗಳು",
    "vendor_tasks_title": "ನನ್ನ ನಿಯೋಜಿತ ಕಾರ್ಯಗಳು",
    "admin_users_title": "ವ್ಯವಸ್ಥೆಯ ಬಳಕೆದಾರರು",
    "admin_categories_title": "ಕುಂದುಕೊರತೆ ವರ್ಗಗಳು",
    "admin_email_logs_title": "ಇಮೇಲ್ ಲಾಗ್‌ಗಳು & ಸಿಸ್ಟಮ್ ಎಚ್ಚರಿಕೆಗಳು",

    "chatbot_title": "AI ನಾಗರಿಕ ಸಹಾಯಕ",
    "chatbot_online": "ಆನ್‌ಲೈನ್ | ಸರ್ಕಾರಿ ದೂರು ಬಾಟ್",
    "chatbot_greeting": "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ನಾಗರಿಕ ಸಹಾಯಕ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
    "chatbot_chip_file": "📝 ದೂರು ಸಲ್ಲಿಸಿ",
    "chatbot_chip_track": "⏱️ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ",
    "chatbot_chip_helpline": "📞 ಸಹಾಯವಾಣಿ 1800-11-2233",
    "chatbot_placeholder": "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ...",
    "chatbot_thinking": "AI ಸಹಾಯಕ ಯೋಚಿಸುತ್ತಿದೆ...",

    "btn_refresh": "ನವೀಕರಿಸಿ",
    "btn_refresh_logs": "ಲಾಗ್‌ಗಳನ್ನು ನವೀಕರಿಸಿ",
    "my_complaints_list_title": "ನನ್ನ ದೂರುಗಳ ಪಟ್ಟಿ",
    "th_complaint_id": "ದೂರು ಐಡಿ",
    "th_title_category": "ಶೀರ್ಷಿಕೆ ಮತ್ತು ವರ್ಗ",
    "th_status": "ಸ್ಥಿತಿ",
    "th_last_update": "ಕೊನೆಯ ನವೀಕರಣ",
    "th_sla_target": "SLA ಗುರಿ",
    "th_action": "ಕ್ರಮ",
    "th_ticket_id": "ಟಿಕೆಟ್ ಐಡಿ",
    "th_issue_details": "ಸಮಸ್ಯೆಯ ವಿವರಗಳು",
    "th_category": "ವರ್ಗ",
    "th_location": "ಸ್ಥಳ (ಅಕ್ಷಾಂಶ/ರೇಖಾಂಶ)",
    "th_name": "ಹೆಸರು",
    "th_email": "ಇಮೇಲ್",
    "th_phone": "ದೂರವಾಣಿ",
    "th_role": "ಪಾತ್ರ",
    "th_cat_name": "ವರ್ಗದ ಹೆಸರು",
    "th_priority": "ಡೀಫಾಲ್ಟ್ ಆದ್ಯತೆ",
    "th_sla_hours": "SLA (ಗಂಟೆಗಳು)",
    "th_sent_time": "ಕಳುಹಿಸಿದ ಸಮಯ",
    "th_recipient": "ಸ್ವೀಕರಿಸುವವರು",
    "th_delivery_status": "ವಿತರಣಾ ಸ್ಥಿತಿ",
    "active_complaints_title": "ಸಕ್ರಿಯ ಸಾರ್ವಜನಿಕ ದೂರುಗಳು",
    "btn_all_complaints": "ಎಲ್ಲಾ ದೂರುಗಳು",
    "btn_flagged_duplicates": "ನಕಲಿ ಗುರುತಿಸಲಾದ ದೂರುಗಳು",
    "btn_add_user": "ಬಳಕೆದಾರರನ್ನು ಸೇರಿಸಿ",
    "btn_add_category": "ವರ್ಗ ಸೇರಿಸಿ",
    "all_registered_users": "ಎಲ್ಲಾ ನೋಂದಾಯಿತ ಬಳಕೆದಾರರು",
    "all_categories": "ಎಲ್ಲಾ ವರ್ಗಗಳು",
    "audit_log_title": "ವ್ಯವಸ್ಥೆಯ ಇಮೇಲ್ ಆಡಿಟ್ ಲಾಗ್",
    "filter_all": "ಎಲ್ಲಾ",
    "filter_submitted": "ಸಲ್ಲಿಸಲಾಗಿದೆ",
    "filter_assigned": "ನಿಯೋಜಿಸಲಾಗಿದೆ",
    "filter_in_progress": "ಪ್ರಗತಿಯಲ್ಲಿದೆ",
    "filter_resolved": "ಪರಿಹರಿಸಲಾಗಿದೆ",
    "filter_escalated": "ಉಲ್ಬಣಗೊಂಡಿದೆ",
    "filter_closed": "ಮುಚ್ಚಲಾಗಿದೆ",
    "card_log_new_title": "ಹೊಸ ದೂರು ಸಲ್ಲಿಸಿ",
    "card_log_new_sub": "ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ನಾಗರಿಕ ಸಮಸ್ಯೆಯನ್ನು ವರದಿ ಮಾಡಿ. ಸ್ಥಳವನ್ನು ಸ್ವಯಂ-ಭರ್ತಿ ಮಾಡಲು GPS ಬಳಸಿ.",
    "card_log_new_btn": "ಪ್ರಾರಂಭಿಸಿ",
    "card_view_complaints_title": "ನನ್ನ ದೂರುಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    "card_view_complaints_sub": "ಸಲ್ಲಿಸಿದ ಸಮಸ್ಯೆಗಳ ಪ್ರಗತಿ ಮತ್ತು ಪರಿಹಾರ ಸ್ಥಿತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.",
    "card_view_complaints_btn": "ಇತಿಹಾಸ ವೀಕ್ಷಿಸಿ",
    "btn_cancel": "ರದ್ದುಮಾಡಿ",
    "btn_update": "ನವೀಕರಿಸಿ",
    "btn_assign": "ನಿಯೋಜಿಸಿ",
    "btn_track": "ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
    "btn_view_resolution": "ಪರಿಹಾರವನ್ನು ವೀಕ್ಷಿಸಿ",
    "home_portal_title": "ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಚಾಲಿತ ಸಾರ್ವಜನಿಕ ಕುಂದುಕೊರತೆ ನಿರ್ವಹಣಾ ವ್ಯವಸ್ಥೆ",
    "home_tagline": "ನಿಮ್ಮ ಧ್ವನಿ, ನಮ್ಮ ಕರ್ತವ್ಯ",
    "home_dept_login": "ಇಲಾಖಾ ಲಾಗಿನ್",
    "home_hero_badge": "ನಾಗರಿಕ ಕುಂದುಕೊರತೆ ಸೇವೆಗಳು",
    "home_hero_title": "ಇಲ್ಲಿ ನಿಮ್ಮ ಕುಂದುಕೊರತೆ ಸಲ್ಲಿಸಿ",
    "home_hero_subtitle": "ನಗರಪಾಲಿಕೆ ಮತ್ತು ಸರ್ಕಾರಿ ಇಲಾಖೆಗಳಿಗೆ ಸಂಬಂಧಿಸಿದೆ",
    "home_hero_desc": "ನಗರಪಾಲಿಕೆಗೆ ನೇರವಾಗಿ ದೂರು ಸಲ್ಲಿಸಿ. ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಆಧಾರಿತ ವರ್ಗೀಕರಣ, ವಾರ್ಡ್ ಅಧಿಕಾರಿಗೆ ಸ್ವಯಂಚಾಲಿತ ಹಂಚಿಕೆ ಮತ್ತು ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್.",
    "home_file_btn": "ಕುಂದುಕೊರತೆ ಸಲ್ಲಿಸಿ",
    "home_register_btn": "ನಾಗರಿಕ ನೋಂದಣಿ",
    "home_track_title": "ದೂರಿನ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ",
    "home_track_placeholder": "ರೆಫರೆನ್ಸ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ (ಉದಾ: GRV-2026-000001)",
    "home_track_btn": "ಪರಿಶೀಲಿಸಿ",
    "home_stats_title": "ನೇರ ಕುಂದುಕೊರತೆ ಪರಿಹಾರ ಅಂಕಿಅಂಶಗಳು",
    "home_stat_total": "ಒಟ್ಟು ನೋಂದಾಯಿತ",
    "home_stat_pending": "ವಿಮರ್ಶೆಯಲ್ಲಿರುವ ಬಾಕಿ",
    "home_stat_ongoing": "ಪ್ರಗತಿಯಲ್ಲಿರುವ ಕಾಮಗಾರಿ",
    "home_stat_resolved": "ಪರಿಹರಿಸಲಾದ ದೂರುಗಳು",
    "home_stat_rate": "ಪರಿಹಾರ ದರ",
    "home_services_title": "ನಾಗರಿಕ ಸೇವಾ ವಿಭಾಗಗಳು",
    "home_services_subtitle": "ಸ್ಥಳೀಯ ಸಮಸ್ಯೆಗಳನ್ನು ಸಂಬಂಧಿತ ಪಾಲಿಕೆ ಇಲಾಖೆಗೆ ವರದಿ ಮಾಡಲು ವಿಭಾಗ ಆಯ್ಕೆಮಾಡಿ",
    "home_cat_road": "ರಸ್ತೆಗಳು ಮತ್ತು ಪಾದಚಾರಿ ಮಾರ್ಗಗಳು",
    "home_cat_road_desc": "ಗುಂಡಿಗಳು, ಹಾಳಾದ ರಸ್ತೆ ಮೇಲ್ಮೈ, ಮುರಿದ ಪಾದಚಾರಿ ಮಾರ್ಗಗಳು",
    "home_cat_water": "ಕುಡಿಯುವ ನೀರು ಸರಬರಾಜು",
    "home_cat_water_desc": "ಪೈಪ್‌ಲೈನ್ ಸೋರಿಕೆ, ಕಲುಷಿತ ನೀರು, ಕಡಿಮೆ ಒತ್ತಡ, ಸರಬರಾಜು ವ್ಯತ್ಯಯ",
    "home_cat_drain": "ಒಳಚರಂಡಿ ಮತ್ತು ಚರಂಡಿ ವ್ಯವಸ್ಥೆ",
    "home_cat_drain_desc": "ತೆರೆದ ಚರಂಡಿ ಉಕ್ಕಿ ಹರಿಯುವುದು, ಮ್ಯಾನ್‌ಹೋಲ್ ಬ್ಲಾಕ್, ಕೊಳಚೆ ನೀರು ನಿಲ್ಲುವುದು",
    "home_cat_garbage": "ಘನತ್ಯಾಜ್ಯ ಮತ್ತು ನೈರ್ಮಲ್ಯ",
    "home_cat_garbage_desc": "ಕಸದ ರಾಶಿ, ಸಾರ್ವಜನಿಕ ಸ್ಥಳದಲ್ಲಿ ಕಸ ಎಸೆಯುವುದು, ಸ್ವಚ್ಛತಾ ವಿನಂತಿ",
    "home_cat_light": "ಬೀದಿ ದೀಪಗಳು",
    "home_cat_light_desc": "ಕೆಟ್ಟುಹೋದ ಬೀದಿದೀಪಗಳು, ಕತ್ತಲೆ ಪ್ರದೇಶಗಳು, ಹಾನಿಗೊಳಗಾದ ಕಂಬಗಳು",
    "home_how_title": "ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ",
    "home_how_subtitle": "ದೂರು ಸಲ್ಲಿಕೆಯಿಂದ ಪರಿಹಾರ ದೃಢೀಕರಣದವರೆಗೆ ನಾಲ್ಕು ಸರಳ ಹಂತಗಳು",
    "home_step1_title": "1. ದೂರು ಸಲ್ಲಿಸಿ",
    "home_step1_desc": "ಜಿಪಿಎಸ್ ಲೊಕೇಶನ್‌ನೊಂದಿಗೆ ಸಮಸ್ಯೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    "home_step2_title": "2. ಎಐ ಸ್ಮಾರ್ಟ್ ವಿಂಗಡಣೆ",
    "home_step2_desc": "ಎಐ ದೂರನ್ನು ವಿಂಗಡಿಸಿ ಸ್ಥಳೀಯ ವಾರ್ಡ್ ಅಧಿಕಾರಿಗೆ ಎಸ್‌ಎಲ್‌ಎ ನೀಡುತ್ತದೆ.",
    "home_step3_title": "3. ಗುತ್ತಿಗೆದಾರರ ದುರಸ್ತಿ",
    "home_step3_desc": "ಗುತ್ತಿಗೆದಾರರು ದುರಸ್ತಿ ನಡೆಸಿ ಮುಂಚಿನ ಮತ್ತು ನಂತರದ ಫೋಟೋ ಸಲ್ಲಿಸುತ್ತಾರೆ.",
    "home_step4_title": "4. ನಾಗರಿಕರ ದೃಢೀಕರಣ",
    "home_step4_desc": "ಅಧಿಕಾರಿ ಪರಿಶೀಲಿಸಿ ದೂರು ಮುಕ್ತಾಯಗೊಳಿಸುತ್ತಾರೆ, ನಾಗರಿಕರು ರೇಟಿಂಗ್ ನೀಡಬಹುದು.",
    "home_helpline_title": "24x7 ನಾಗರಿಕ ಸಹಾಯವಾಣಿ ಮತ್ತು ಬೆಂಬಲ",
    "home_helpline_tollfree": "ಉಚಿತ ಸಹಾಯವಾಣಿ: 1902 / 1800-425-0000",
    "home_helpline_email": "grievances@karnataka.gov.in",
    "home_helpline_sub": "ಎಲ್ಲಾ ವಾರ್ಡ್‌ಗಳ ನಾಗರಿಕ ಕುಂದುಕೊರತೆಗಳಿಗಾಗಿ ದಿನದ 24 ಗಂಟೆಯೂ ಸೇವೆ ಲಭ್ಯವಿದೆ."
  },

  hi: {
    "nav_portal_title": "शिकायत निवारಣ केंद्र",
    "nav_dashboard": "डैशबोर्ड",
    "nav_admin_tools": "व्यवस्थापक उपकरण",
    "nav_complaints": "शिकायतें",
    "nav_log_complaint": "शिकायत दर्ज करें",
    "nav_my_complaints": "मेरी शिकायतें ट्रैक करें",
    "nav_officer_tools": "अधिकारी उपकरण",
    "nav_assign_complaints": "शिकायतें आवंटित करें",
    "nav_vendor_tasks": "विक्रेता कार्य",
    "nav_my_tasks": "मेरे सौंपे गए कार्य",
    "nav_rep_tools": "प्रतिनिधि उपकरण",
    "nav_area_complaints": "क्षेत्र की शिकायतें",
    "nav_manage_users": "उपयोगकर्ता प्रबंधन",
    "nav_manage_categories": "श्रेणी प्रबंधन",
    "nav_email_logs": "ईमेल लॉग",
    "nav_logout": "लॉग आउट",
    "nav_welcome": "स्वागत है",

    "login_header": "अपने खाते में साइन इन करें",
    "login_subtitle": "नागरिक शिकायत पोर्टल सेवाओं तक पहुंचें और स्थिति ट्रैक करें",
    "username_label": "उपयोगकर्ता नाम",
    "username_placeholder": "उपयोगकर्ता नाम दर्ज करें",
    "password_label": "पासवर्ड",
    "password_placeholder": "••••••••",
    "login_button": "लॉग इन करें",
    "no_account_text": "खाता नहीं है?",
    "sign_up_link": "रजिस्टर / साइन अप करें",

    "signup_header": "अपना खाता बनाएं",
    "signup_subtitle": "स्मार्ट नागरिक शिकायत निवारण नेटवर्क में शामिल हों",
    "full_name_label": "पूरा नाम",
    "email_label": "ईमेल पता",
    "phone_label": "फ़ोन नंबर",
    "role_label": "भूमिका",
    "preferred_lang_label": "पसंदीदा भाषा",
    "signup_button": "साइन अप करें",
    "already_account_text": "क्या आपके पास पहले से एक खाता है?",

    "submit_header": "नई शिकायत दर्ज करें",
    "submit_subtitle": "कृपया सटीक विवरण प्रदान करें ताकि आपकी समस्या का शीघ्र समाधान हो सके।",
    "submit_title_label": "शीर्षक",
    "submit_title_placeholder": "समस्या का संक्षिप्त शीर्षक",
    "submit_category_label": "श्रेणी",
    "submit_category_auto": "✨ AI से स्वतः श्रेणी पहचानें",
    "submit_desc_label": "विवरण",
    "submit_desc_placeholder": "समस्या का विस्तार से वर्णन करें — क्या, कहाँ, कब…",
    "submit_refine_ai": "AI से सुधारें",
    "submit_ai_triage_title": "AI स्मार्ट विश्लेषण पूर्वावलोकन",
    "submit_location_label": "📍 स्थान",
    "submit_use_location_btn": "मेरे वर्तमान स्थान का उपयोग करें",
    "submit_evidence_label": "साक्ष्य फोटो",
    "submit_btn": "शिकायत सबमिट करें",
    "location_auto_sub": "हम आपके क्षेत्र का पता स्वतः भर देंगे",
    "or_manual_location": "या अपना स्थान मैन्युअल रूप से दर्ज करें",
    "landmark_label": "कोई विशिष्ट लैंडमार्क या पता विवरण जोड़ें",
    "open_camera_btn": "कैमरा खोलें",
    "upload_photo_btn": "फोटो अपलोड करें",
    "camera_help_text": "मौके पर फोटो खींचें या मौजूदा छवि अपलोड करें।",

    "dashboard_title": "डैशबोर्ड",
    "dashboard_welcome": "आपके शिकायत प्रबंधन अवलोकन में आपका स्वागत है।",
    "stat_total": "कुल शिकायतें",
    "stat_pending": "लंबित शिकायतें",
    "stat_resolved": "हल की गई शिकायतें",
    "stat_escalated": "बढ़ी हुई शिकायतें",

    "my_complaints_title": "नागरिक शिकायत डैशबोर्ड",
    "my_complaints_subtitle": "आवेदन ट्रैक करें, स्थिति सूचनाएं देखें और प्राथमिकताओं का प्रबंधन करें।",
    "report_new_problem": "+ नई समस्या दर्ज करें",
    "tab_applications": "मेरे आवेदन / शिकायतें",
    "tab_recent_notifications": "हाल की सूचनाएं",
    "tab_preferences": "अधिसूचना प्राथमिकताएं",
    "tab_history": "अधिसूचना इतिहास",

    "problem_solved_btn": "समस्या हल हो गई",
    "problem_not_solved_btn": "समस्या हल नहीं हुई",
    "was_issue_solved": "क्या आपकी समस्या का समाधान हो गया?",
    "official_resolution_note": "आधिकारिक समाधान नोट:",

    "officer_assign_title": "शिकायतें आवंटित करें",
    "rep_area_title": "क्षेत्र की शिकायतें",
    "vendor_tasks_title": "मेरे सौंपे गए कार्य",
    "admin_users_title": "सिस्टम उपयोगकर्ता",
    "admin_categories_title": "शिकायत श्रेणियां",
    "admin_email_logs_title": "व्यवस्थापक ईमेल लॉग और सिस्टम अलर्ट",

    "chatbot_title": "AI नागरिक सहायक",
    "chatbot_online": "ऑनलाइन | सरकारी शिकायत बॉट",
    "chatbot_greeting": "नमस्ते! मैं आपका AI नागरिक सहायक हूँ। आज मैं आपका किस प्रकार मार्गदर्शन कर सकता हूँ?",
    "chatbot_chip_file": "📝 शिकायत दर्ज करें",
    "chatbot_chip_track": "⏱️ स्थिति ट्रैक करें",
    "chatbot_chip_helpline": "📞 हेल्पलाइन 1800-11-2233",
    "chatbot_placeholder": "अपना प्रश्न टाइप करें...",
    "chatbot_thinking": "AI सहायक सोच रहा है...",

    "btn_refresh": "ताज़ा करें",
    "btn_refresh_logs": "लॉग ताज़ा करें",
    "my_complaints_list_title": "मेरी शिकायतों की सूची",
    "th_complaint_id": "शिकायत आईडी",
    "th_title_category": "शीर्षक और श्रेणी",
    "th_status": "स्थिति",
    "th_last_update": "अंतिम अपडेट",
    "th_sla_target": "SLA लक्ष्य",
    "th_action": "कार्रवाई",
    "th_ticket_id": "टिकट आईडी",
    "th_issue_details": "समस्या का विवरण",
    "th_category": "श्रेणी",
    "th_location": "स्थान",
    "th_name": "नाम",
    "th_email": "ईमेल",
    "th_phone": "फ़ोन",
    "th_role": "भूमिका",
    "th_cat_name": "श्रेणी का नाम",
    "th_priority": "प्राथमिकता",
    "th_sla_hours": "SLA (घंटे)",
    "th_sent_time": "भेजने का समय",
    "th_recipient": "प्राप्तकर्ता",
    "th_delivery_status": "वितरण स्थिति",
    "active_complaints_title": "सक्रिय सार्वजनिक शिकायतें",
    "btn_all_complaints": "सभी शिकायतें",
    "btn_flagged_duplicates": "चिह्नित डुप्लिकेट",
    "btn_add_user": "उपयोगकर्ता जोड़ें",
    "btn_add_category": "श्रेणी जोड़ें",
    "all_registered_users": "सभी पंजीकृत उपयोगकर्ता",
    "all_categories": "सभी श्रेणियां",
    "audit_log_title": "सिस्टम ईमेल ऑडिट लॉग",
    "filter_all": "सभी",
    "filter_submitted": "दर्ज",
    "filter_assigned": "आवंटित",
    "filter_in_progress": "प्रगति पर",
    "filter_resolved": "हल किया गया",
    "filter_escalated": "बढ़ी हुई",
    "filter_closed": "बंद",
    "card_log_new_title": "नई शिकायत दर्ज करें",
    "card_log_new_sub": "अपने क्षेत्र में नागरिक समस्या की रिपोर्ट करें। पता भरने के लिए GPS का उपयोग करें।",
    "card_log_new_btn": "शुरू करें",
    "card_view_complaints_title": "मेरी शिकायतें देखें",
    "card_view_complaints_sub": "अपनी सबमिट की गई समस्याओं की प्रगति और समाधान स्थिति ट्रैक करें।",
    "card_view_complaints_btn": "इतिहास देखें",
    "btn_cancel": "रद्द करें",
    "btn_update": "अपडेट करें",
    "btn_assign": "आवंटित करें",
    "btn_track": "ट्रैक करें",
    "btn_view_resolution": "समाधान देखें",
    "home_portal_title": "एआई-संचालित जन शिकायत निवारण प्रणाली",
    "home_tagline": "आपकी आवाज़, हमारा कर्तव्य",
    "home_dept_login": "विभागीय लॉगिन",
    "home_hero_badge": "नागरिक शिकायत सेवाएं",
    "home_hero_title": "अपनी शिकायत यहाँ दर्ज करें",
    "home_hero_subtitle": "नगरपालिका एवं सरकारी विभागों से संबंधित",
    "home_hero_desc": "नगर निगम को सीधे अपनी शिकायत दर्ज कराएं। एआई द्वारा स्वचालित वर्गीकरण, वार्ड अधिकारी को त्वरित आवंटन और वास्तविक समय ट्रैकिंग।",
    "home_file_btn": "शिकायत दर्ज करें",
    "home_register_btn": "नागरिक पंजीकरण",
    "home_track_title": "अपनी शिकायत ट्रैक करें",
    "home_track_placeholder": "उदा. GRV-2026-000001",
    "home_track_btn": "स्थिति देखें",
    "home_stats_title": "लाइव शिकायत निवारण आंकड़े",
    "home_stat_total": "कुल पंजीकृत शिकायतें",
    "home_stat_pending": "समीक्षा हेतु लंबित",
    "home_stat_ongoing": "कार्य प्रगति पर",
    "home_stat_resolved": "हल की गई शिकायतें",
    "home_stat_rate": "निवारण दर",
    "home_services_title": "नागरिक सेवा श्रेणियां",
    "home_services_subtitle": "संबंधित विभाग को समस्या की सूचना देने के लिए श्रेणी चुनें",
    "home_cat_road": "सड़कें एवं फुटपाथ",
    "home_cat_road_desc": "गड्ढे, टूटी सड़कें, क्षतिग्रस्त फुटपाथ और मरम्मत की मांग",
    "home_cat_water": "जलापूर्ति",
    "home_cat_water_desc": "पाइपलाइन लीकेज, दूषित पेयजल, कम दबाव, आपूर्ति बाधा",
    "home_cat_drain": "जल निकासी एवं सीवरेज",
    "home_cat_drain_desc": "नाली का उफान, मैनहोल अवरोध, गंदे पानी का भराव",
    "home_cat_garbage": "ठोस अपशिष्ट एवं स्वच्छता",
    "home_cat_garbage_desc": "कचरे का ढेर, सार्वजनिक कूड़ा, नियमित सफाई की मांग",
    "home_cat_light": "स्ट्रीट लाइट",
    "home_cat_light_desc": "खराब स्ट्रीट लाइट, अंधेरा क्षेत्र, क्षतिग्रस्त खंभे और खुले तार",
    "home_how_title": "यह कैसे काम करता है",
    "home_how_subtitle": "शिकायत दर्ज करने से लेकर सत्यापन तक 4 आसान चरण",
    "home_step1_title": "1. शिकायत दर्ज करें",
    "home_step1_desc": "जीपीएस लोकेशन के साथ समस्या का फोटो अपलोड करें।",
    "home_step2_title": "2. एआई वर्गीकरण",
    "home_step2_desc": "एआई तुरंत विभाग तय कर वार्ड अधिकारी को समयबद्ध कार्य सौंपता है।",
    "home_step3_title": "3. ठेकेदार द्वारा मरम्मत",
    "home_step3_desc": "ठेकेदार मौके पर पहुंचकर मरम्मत कर कार्य पूरा होने का प्रमाण अपलोड करता है।",
    "home_step4_title": "4. नागरिक सत्यापन",
    "home_step4_desc": "अधिकारी निरीक्षण के बाद शिकायत बंद करता है और नागरिक फीडबैक दे सकते हैं।",
    "home_helpline_title": "24x7 नागरिक हेल्पलाइन एवं सहायता",
    "home_helpline_tollfree": "टोल-फ्री हेल्पलाइन: 1902 / 1800-425-0000",
    "home_helpline_email": "grievances@karnataka.gov.in",
    "home_helpline_sub": "सभी वार्डों में नागरिक शिकायतों के निवारण हेतु 24 घंटे सेवा उपलब्ध।"
  },

  te: {
    "nav_portal_title": "ఫిర్యాదుల కేంద్రం",
    "nav_dashboard": "డ్యాష్‌బోర్డ్",
    "nav_admin_tools": "అడ్మిన్ సాధనాలు",
    "nav_complaints": "ఫిర్యాదులు",
    "nav_log_complaint": "ఫిర్యాదు చేయండి",
    "nav_my_complaints": "నా ఫిర్యాదులను ట్రాక్ చేయండి",
    "nav_officer_tools": "అధికారి సాధనాలు",
    "nav_assign_complaints": "ఫిర్యాదులను కేటాయించండి",
    "nav_vendor_tasks": "వెండర్ పనులు",
    "nav_my_tasks": "నాకు కేటాయించిన పనులు",
    "nav_rep_tools": "ప్రజాప్రతినిధి సాధనాలు",
    "nav_area_complaints": "ప్రాంత ఫిర్యాదులు",
    "nav_manage_users": "వినియోగదారుల నిర్వహణ",
    "nav_manage_categories": "వర్గాల నిర్వహణ",
    "nav_email_logs": "ఇమెయిల్ లాగ్స్",
    "nav_logout": "లాగ్ అవుట్",
    "nav_welcome": "స్వాగతం",

    "login_header": "మీ ఖాతాలోకి ప్రవేశించండి",
    "login_subtitle": "పౌర ఫిర్యాదుల సేవలను పొందండి & స్థితిని ట్రాక్ చేయండి",
    "username_label": "వినియోగదారు పేరు",
    "username_placeholder": "వినియోగదారు పేరు నమోదు చేయండి",
    "password_label": "పాస్‌వర్డ్",
    "password_placeholder": "••••••••",
    "login_button": "లాగిన్ అవ్వండి",
    "no_account_text": "ఖాతా లేదా?",
    "sign_up_link": "నమోదు చేసుకోండి / సైన్ అప్",

    "signup_header": "మీ ఖాతాను సృష్టించండి",
    "signup_subtitle": "స్మార్ట్ పౌర ఫిర్యాదుల పరిష్కార నెట్‌వర్క్‌లో చేరండి",
    "full_name_label": "పూర్తి పేరు",
    "email_label": "ఇమెయిల్ చిరునామా",
    "phone_label": "ఫోన్ నంబర్",
    "role_label": "పాత్ర",
    "preferred_lang_label": "ప్రాధాన్య భాష",
    "signup_button": "సైన్ అప్ చేయండి",
    "already_account_text": "ఇప్పటికే ఖాతా ఉందా?",

    "submit_header": "కొత్త ఫిర్యాదు నమోదు చేయండి",
    "submit_subtitle": "మీ సమస్య త్వరగా పరిష్కరించబడటానికి ఖచ్చితమైన వివరాలను అందించండి.",
    "submit_title_label": "శీర్షిక",
    "submit_title_placeholder": "సమస్య యొక్క సంక్షిప్త శీర్షిక",
    "submit_category_label": "వర్గం",
    "submit_category_auto": "✨ AI ద్వారా వర్గాన్ని గుర్తించండి",
    "submit_desc_label": "వివరణ",
    "submit_desc_placeholder": "సమస్యను వివరంగా వివరించండి — ఏమిటి, ఎక్కడ, ఎప్పుడు…",
    "submit_refine_ai": "AI తో మెరుగుపరచండి",
    "submit_ai_triage_title": "AI విశ్లేషణ ముందస్తు వీక్షణ",
    "submit_location_label": "📍 ప్రాంతం",
    "submit_use_location_btn": "నా ప్రస్తుత లొకేషన్ ఉపయోగించండి",
    "submit_evidence_label": "ఆధారాల ఫోటో",
    "submit_btn": "ఫిర్యాదు సమర్పించండి",
    "location_auto_sub": "మేము మీ ప్రాంతం చిరునామాను ఆటో-ఫిల్ చేస్తాము",
    "or_manual_location": "లేదా మీ లొకేషన్‌ను మాన్యువల్‌గా నమోదు చేయండి",
    "landmark_label": "నిర్దిష్ట ల్యాండ్‌మార్క్ లేదా అడ్రస్ వివరాలను జోడించండి",
    "open_camera_btn": "కెమెరా తెరవండి",
    "upload_photo_btn": "ఫోటో అప్‌లోడ్ చేయండి",
    "camera_help_text": "వెంటనే ఫోటో తీయండి లేదా ఫోటోను అప్‌లోడ్ చేయండి.",

    "dashboard_title": "డ్యాష్‌బోర్డ్",
    "dashboard_welcome": "మీ ఫిర్యాదుల నిర్వహణ అవలోకనానికి స్వాగతం.",
    "stat_total": "మొత్తం ఫిర్యాదులు",
    "stat_pending": "పెండింగ్‌లో ఉన్నవి",
    "stat_resolved": "పరిష్కరించబడినవి",
    "stat_escalated": "తీవ్రతరం చేయబడినవి",

    "my_complaints_title": "పౌర ఫిర్యాదుల డ్యాష్‌బోర్డ్",
    "my_complaints_subtitle": "దరఖాస్తులను ట్రాక్ చేయండి, నోటిఫికేషన్‌లను చూడండి మరియు ప్రాధాన్యతలను నిర్వహించండి.",
    "report_new_problem": "+ కొత్త సమస్యను నమోదు చేయండి",
    "tab_applications": "నా దరఖాస్తులు / ఫిర్యాదులు",
    "tab_recent_notifications": "ఇటీవలి నోటిఫికేషన్‌లు",
    "tab_preferences": "నోటిఫికేషన్ ప్రాధాన్యతలు",
    "tab_history": "నోటిఫికేషన్ చరిత్ర",

    "problem_solved_btn": "సమస్య పరిష్కారమైంది",
    "problem_not_solved_btn": "సమస్య పరిష్కారం కాలేదు",
    "was_issue_solved": "మీ సమస్య పరిష్కారం అయిందా?",
    "official_resolution_note": "అధికారిక పరిష్కార గమనిక:",

    "officer_assign_title": "ఫిర్యాదులను కేటాయించండి",
    "rep_area_title": "ప్రాంత ఫిర్యాదులు",
    "vendor_tasks_title": "నాకు కేటాయించిన పనులు",
    "admin_users_title": "సిస్టమ్ వినియోగదారులు",
    "admin_categories_title": "ఫిర్యాదు వర్గాలు",
    "admin_email_logs_title": "అడ్మిన్ ఇమెయిల్ లాగ్స్ & హెచ్చరికలు",

    "chatbot_title": "AI పౌర సహాయకుడు",
    "chatbot_online": "ఆన్‌లైన్ | ప్రభుత్వ ఫిర్యాదుల బాట్",
    "chatbot_greeting": "నమస్కారం! నేను మీ AI పౌర సహాయకుడిని. ఈరోజు నేను మీకు ఎలా సహాయపడగలను?",
    "chatbot_chip_file": "📝 ఫిర్యాదు చేయండి",
    "chatbot_chip_track": "⏱️ స్థితిని ట్రాక్ చేయండి",
    "chatbot_chip_helpline": "📞 హెల్ప్‌లైన్ 1800-11-2233",
    "chatbot_placeholder": "మీ ప్రశ్నను టైప్ చేయండి...",
    "chatbot_thinking": "AI సహాయకుడు ఆలోచిస్తున్నాడు...",

    "btn_refresh": "రిఫ్రెష్ చేయండి",
    "btn_refresh_logs": "లాగ్‌లను రిఫ్రెష్ చేయండి",
    "my_complaints_list_title": "నా ఫిర్యాదుల జాబితా",
    "th_complaint_id": "ఫిర్యాదు ఐడి",
    "th_title_category": "శీర్షిక & వర్గం",
    "th_status": "స్థితి",
    "th_last_update": "చివరి అప్‌డేట్",
    "th_sla_target": "SLA లక్ష్యం",
    "th_action": "చర్య",
    "th_ticket_id": "టికెట్ ఐడి",
    "th_issue_details": "సమస్య వివరాలు",
    "th_category": "వర్గం",
    "th_location": "ప్రాంతం",
    "th_name": "పేరు",
    "th_email": "ఇమెయిల్",
    "th_phone": "ఫోన్",
    "th_role": "పాత్ర",
    "th_cat_name": "వర్గం పేరు",
    "th_priority": "ప్రాధాన్యత",
    "th_sla_hours": "SLA (గంటలు)",
    "th_sent_time": "పంపిన సమయం",
    "th_recipient": "గ్రహీత",
    "th_delivery_status": "డెలివరీ స్థితి",
    "active_complaints_title": "క్రియాశీల ప్రజా ఫిర్యాదులు",
    "btn_all_complaints": "అన్ని ఫిర్యాదులు",
    "btn_flagged_duplicates": "నకిలీ ఫిర్యాదులు",
    "btn_add_user": "వినియోగదారుని జోడించండి",
    "btn_add_category": "వర్గాన్ని జోడించండి",
    "all_registered_users": "నమోదైన వినియోగదారులు",
    "all_categories": "అన్ని వర్గాలు",
    "audit_log_title": "సిస్టమ్ ఇమెయిల్ ఆడిట్ లాగ్",
    "filter_all": "అన్నీ",
    "filter_submitted": "సమర్పించబడింది",
    "filter_assigned": "కేటాయించబడింది",
    "filter_in_progress": "పురోగతిలో ఉంది",
    "filter_resolved": "పరిష్కరించబడింది",
    "filter_escalated": "తీవ్రతరం చేయబడింది",
    "filter_closed": "మూసివేయబడింది",
    "card_log_new_title": "కొత్త ఫిర్యాదు నమోదు చేయండి",
    "card_log_new_sub": "మీ ప్రాంతంలో సమస్యను నివేదించండి. అడ్రస్ ఆటో-ఫిల్ చేయడానికి GPS వాడండి.",
    "card_log_new_btn": "ప్రారంభించండి",
    "card_view_complaints_title": "నా ఫిర్యాదులను చూడండి",
    "card_view_complaints_sub": "ఫిర్యాదు పురోగతి మరియు పరిష్కార స్థితిని ట్రాక్ చేయండి.",
    "card_view_complaints_btn": "చరిత్రను చూడండి",
    "btn_cancel": "రద్దు చేయండి",
    "btn_update": "అప్‌డేట్ చేయండి",
    "btn_assign": "కేటాయించండి",
    "btn_track": "ట్రాక్ చేయండి",
    "btn_view_resolution": "పరిష్కారాన్ని చూడండి",
    "home_portal_title": "AI-ఆధారిత ప్రజా ఫిర్యాదుల నిర్వహణ వ్యవస్థ",
    "home_tagline": "మీ స్వరం, మా కర్తవ్యం",
    "home_dept_login": "విభాగ లాగిన్",
    "home_hero_badge": "పౌర ఫిర్యాదు సేవలు",
    "home_hero_title": "ఇక్కడ మీ ఫిర్యాదు నమోదు చేయండి",
    "home_hero_subtitle": "పురపాలక మరియు ప్రభుత్వ విభాగాలకు సంబంధించినది",
    "home_hero_desc": "మునిసిపల్ అధికారులకు నేరుగా ఫిర్యాదు నమోదు చేయండి. AI ఆటోమేటిక్ వర్గీకరణ, వార్డ్ అధికారి కేటాయింపు మరియు రియల్-టైమ్ ట్రాకింగ్.",
    "home_file_btn": "ఫిర్యాదు నమోదు చేయండి",
    "home_register_btn": "పౌర నమోదు",
    "home_track_title": "ఫిర్యాదు పరిస్థితిని ట్రాక్ చేయండి",
    "home_track_placeholder": "ఉదా: GRV-2026-000001",
    "home_track_btn": "పరిస్థితి చూడండి",
    "home_stats_title": "ప్రత్యక్ష ఫిర్యాదుల పరిష్కార గణాంకాలు",
    "home_stat_total": "మొత్తం నమోదైనవి",
    "home_stat_pending": "పరిశీలనలో ఉన్నవి",
    "home_stat_ongoing": "పని జరుగుతోంది",
    "home_stat_resolved": "పరిష్కరించబడినవి",
    "home_stat_rate": "పరిష్కార శాతం",
    "home_services_title": "పౌర సేవల వర్గాలు",
    "home_services_subtitle": "సంబంధిత విభాగానికి సమస్యను నివేదించడానికి వర్గాన్ని ఎంచుకోండి",
    "home_cat_road": "రోడ్లు మరియు ఫుట్‌పాత్‌లు",
    "home_cat_road_desc": "గుంతలు, దెబ్బతిన్న రోడ్లు, విరిగిన ఫుట్‌పాత్‌లు",
    "home_cat_water": "నీటి సరఫరా",
    "home_cat_water_desc": "పైప్‌లైన్ లీకేజీలు, కలుషిత నీరు, తక్కువ ఒత్తిడి",
    "home_cat_drain": "డ్రైనేజీ మరియు మురుగునీరు",
    "home_cat_drain_desc": "కాలువల పొంగు, మ్యాన్‌హోల్ అడ్డంకులు, నీటి నిల్వ",
    "home_cat_garbage": "ఘన వ్యర్థాలు మరియు పారిశుధ్యం",
    "home_cat_garbage_desc": "చెత్త కుప్పలు, బహిరంగ చెత్త, పారిశుధ్య అభ్యర్థనలు",
    "home_cat_light": "వీధి దీపాలు",
    "home_cat_light_desc": "పనిచేయని వీధి దీపాలు, చీకటి ప్రదేశాలు, దెబ్బతిన్న స్తంభాలు",
    "home_how_title": "ఇది ఎలా పనిచేస్తుంది",
    "home_how_subtitle": "ఫిర్యాదు నమోదు నుండి ధృవీకరించబడిన పరిష్కారం వరకు 4 సాధారణ దశలు",
    "home_step1_title": "1. ఫిర్యాదు చేయండి",
    "home_step1_desc": "GPS లొకేషన్‌తో సమస్య ఫోటోను అప్‌లోడ్ చేయండి.",
    "home_step2_title": "2. AI స్మార్ట్ వర్గీకరణ",
    "home_step2_desc": "AI ఫిర్యాదును వర్గీకరించి వార్డ్ అధికారికి అప్పగిస్తుంది.",
    "home_step3_title": "3. మరమ్మతు నిర్వహణ",
    "home_step3_desc": "కాంట్రాక్టర్ పని పూర్తి చేసి ఆధారాల ఫోటో అప్‌లోడ్ చేస్తారు.",
    "home_step4_title": "4. పౌర ధృవీకరణ",
    "home_step4_desc": "అధికారి తనిఖీ చేసి పూర్తి చేస్తారు, పౌరులు రేటింగ్ ఇవ్వవచ్చు.",
    "home_helpline_title": "24x7 పౌర హెల్ప్‌లైన్ మరియు మద్దతు",
    "home_helpline_tollfree": "టోల్-ఫ్రీ హెల్ప్‌లైన్: 1902 / 1800-425-0000",
    "home_helpline_email": "grievances@karnataka.gov.in",
    "home_helpline_sub": "అన్ని వార్డుల పౌరుల సేవల కోసం 24 గంటలూ అందుబాటులో ఉంది."
  },

  ta: {
    "nav_portal_title": "குறைதீர்ப்பு மையம்",
    "nav_dashboard": "டாஷ்போர்டு",
    "nav_admin_tools": "நிர்வாக கருவிகள்",
    "nav_complaints": "புகார்கள்",
    "nav_log_complaint": "புகார் பதிவு செய்க",
    "nav_my_complaints": "என் புகார்களைக் கண்காணிக்கவும்",
    "nav_officer_tools": "அதிகாரி கருவிகள்",
    "nav_assign_complaints": "புகார்களை ஒதுக்குங்கள்",
    "nav_vendor_tasks": "விற்பனையாளர் பணிகள்",
    "nav_my_tasks": "எனக்கு ஒதுக்கப்பட்ட பணிகள்",
    "nav_rep_tools": "பிரதிநிதி கருவிகள்",
    "nav_area_complaints": "பகுதி புகார்கள்",
    "nav_manage_users": "பயனர் மேலாண்மை",
    "nav_manage_categories": "வகை மேலாண்மை",
    "nav_email_logs": "மின்னஞ்சல் பதிவுகள்",
    "nav_logout": "வெளியேறு",
    "nav_welcome": "வரவேற்பு",

    "login_header": "உங்கள் கணக்கில் உள்நுழைக",
    "login_subtitle": "குடிமக்கள் குறைதீர்ப்பு சேவைகளை அணுகவும் & நிலையை கண்காணிக்கவும்",
    "username_label": "பயனர்பெயர்",
    "username_placeholder": "பயனர்பெயரை உள்ளிடவும்",
    "password_label": "கடவுச்சொல்",
    "password_placeholder": "••••••••",
    "login_button": "உள்நுழைக",
    "no_account_text": "கணக்கு இல்லையா?",
    "sign_up_link": "பதிவு செய்க / சைன் அப்",

    "signup_header": "உங்கள் கணக்கை உருவாக்கவும்",
    "signup_subtitle": "ஸ்மார்ட் குடிமக்கள் குறைதீர்ப்பு நெட்வொர்க்கில் இணையுங்கள்",
    "full_name_label": "முழு பெயர்",
    "email_label": "மின்னஞ்சல் முகவரி",
    "phone_label": "தொலைபேசி எண்",
    "role_label": "பங்கு",
    "preferred_lang_label": "விருப்பமான மொழி",
    "signup_button": "பதிவு செய்க",
    "already_account_text": "ஏற்கனவே கணக்கு உள்ளதா?",

    "submit_header": "புதிய புகாரைப் பதிவுசெய்க",
    "submit_subtitle": "சிக்கல் விரைவில் தீர்க்கப்பட சரியான விவரங்களை வழங்கவும்.",
    "submit_title_label": "தலைப்பு",
    "submit_title_placeholder": "சிக்கலின் சுருக்கமான தலைப்பு",
    "submit_category_label": "வகை",
    "submit_category_auto": "✨ AI மூலம் வகையைக் கண்டறியவும்",
    "submit_desc_label": "விளக்கம்",
    "submit_desc_placeholder": "சிக்கலை விரிவாக விவரிக்கவும் — என்ன, எங்கே, எப்போது…",
    "submit_refine_ai": "AI மூலம் செம்மைப்படுத்துங்கள்",
    "submit_ai_triage_title": "AI நுண்ணறிவு முன்னோட்டம்",
    "submit_location_label": "📍 இடம்",
    "submit_use_location_btn": "என் தற்போதைய இருப்பிடத்தைப் பயன்படுத்து",
    "submit_evidence_label": "சான்று புகைப்படம்",
    "submit_btn": "புகாரைச் சமர்ப்பிக்கவும்",
    "location_auto_sub": "உங்கள் பகுதி முகவரியை தானாக நிரப்புவோம்",
    "or_manual_location": "அல்லது உங்கள் இருப்பிடத்தை கைமுறையாக உள்ளிடவும்",
    "landmark_label": "குறிப்பிட்ட அடையாளத்தை உள்ளிடவும்",
    "open_camera_btn": "கேமராவைத் திறக்கவும்",
    "upload_photo_btn": "புகைப்படத்தை பதிவேற்றவும்",
    "camera_help_text": "புகைப்படம் எடுக்கவும் அல்லது பதிவேற்றவும்.",

    "dashboard_title": "டாஷ்போர்டு",
    "dashboard_welcome": "உங்கள் குறைதீர்ப்பு மேலாண்மை மேலோட்டத்திற்கு வருக.",
    "stat_total": "மொத்த புகார்கள்",
    "stat_pending": "நிலுவையில் உள்ளவை",
    "stat_resolved": "தீர்க்கப்பட்ட புகார்கள்",
    "stat_escalated": "தீவிரப்படுத்தப்பட்ட புகார்கள்",

    "my_complaints_title": "குடிமக்கள் குறைதீர்ப்பு டாஷ்போர்டு",
    "my_complaints_subtitle": "விண்ணப்பங்களைக் கண்காணிக்கவும், அறிவிப்புகளைப் பார்க்கவும், விருப்பங்களை நிர்வகிக்கவும்.",
    "report_new_problem": "+ புதிய சிக்கலைப் புகாரளிக்கவும்",
    "tab_applications": "என் விண்ணப்பங்கள் / புகார்கள்",
    "tab_recent_notifications": "சமீபத்திய அறிவிப்புகள்",
    "tab_preferences": "அறிவிப்பு விருப்பங்கள்",
    "tab_history": "அறிவிப்பு வரலாறு",

    "problem_solved_btn": "சிக்கல் தீர்க்கப்பட்டது",
    "problem_not_solved_btn": "சிக்கல் தீர்க்கப்படவில்லை",
    "was_issue_solved": "உங்கள் பிரச்சனை உண்மையில் தீர்க்கப்பட்டதா?",
    "official_resolution_note": "அதிகாரப்பூர்வ தீர்வு குறிப்பு:",

    "officer_assign_title": "புகார்களை ஒதுக்குங்கள்",
    "rep_area_title": "பகுதி புகார்கள்",
    "vendor_tasks_title": "எனக்கு ஒதுக்கப்பட்ட பணிகள்",
    "admin_users_title": "அமைப்பு பயனர்கள்",
    "admin_categories_title": "புகார் வகைகள்",
    "admin_email_logs_title": "நிர்வாக மின்னஞ்சல் பதிவுகள் & அமைப்பு எச்சரிக்கைகள்",

    "chatbot_title": "AI குடிமக்கள் உதவியாளர்",
    "chatbot_online": "ஆன்லைன் | அரசு குறைதீர்ப்பு பாட்",
    "chatbot_greeting": "வணக்கம்! நான் உங்கள் AI குடிமக்கள் உதவியாளர். இன்று நான் உங்களுக்கு எவ்வாறு வழிகாட்ட முடியும்?",
    "chatbot_chip_file": "📝 புகார் பதிவு செய்க",
    "chatbot_chip_track": "⏱️ நிலையை கண்காணிக்கவும்",
    "chatbot_chip_helpline": "📞 உதவி எண் 1800-11-2233",
    "chatbot_placeholder": "உங்கள் கேள்வியைத் தட்டச்சு செய்யவும்...",
    "chatbot_thinking": "AI உதவியாளர் சிந்திக்கிறார்...",

    "btn_refresh": "புதுப்பிக்கவும்",
    "btn_refresh_logs": "பதிவுகளைப் புதுப்பிக்கவும்",
    "my_complaints_list_title": "என் புகார்கள் பட்டியல்",
    "th_complaint_id": "புகார் ஐடி",
    "th_title_category": "தலைப்பு & வகை",
    "th_status": "நிலை",
    "th_last_update": "கடைசி புதுப்பிப்பு",
    "th_sla_target": "SLA இலக்கு",
    "th_action": "நடவடிக்கை",
    "th_ticket_id": "டிக்கெட் ஐடி",
    "th_issue_details": "பிரச்சனை விவரங்கள்",
    "th_category": "வகை",
    "th_location": "இடம்",
    "th_name": "பெயர்",
    "th_email": "மின்னஞ்சல்",
    "th_phone": "தொலைபேசி",
    "th_role": "பங்கு",
    "th_cat_name": "வகை பெயர்",
    "th_priority": "முன்னுரிமை",
    "th_sla_hours": "SLA (மணிநேரம்)",
    "th_sent_time": "அனுப்பப்பட்ட நேரம்",
    "th_recipient": "பெறுநர்",
    "th_delivery_status": "டெலிவரி நிலை",
    "active_complaints_title": "செயலில் உள்ள புகார்கள்",
    "btn_all_complaints": "அனைத்து புகார்கள்",
    "btn_flagged_duplicates": "போலி எனக் குறிக்கப்பட்டவை",
    "btn_add_user": "பயனரைச் சேர்",
    "btn_add_category": "வகையைச் சேர்",
    "all_registered_users": "அனைத்து பதிவுசெய்த பயனர்கள்",
    "all_categories": "அனைத்து வகைகள்",
    "audit_log_title": "மின்னஞ்சல் தணிக்கை பதிவு",
    "filter_all": "அனைத்தும்",
    "filter_submitted": "சமர்ப்பிக்கப்பட்டது",
    "filter_assigned": "ஒதுக்கப்பட்டது",
    "filter_in_progress": "செயலில் உள்ளது",
    "filter_resolved": "தீர்க்கப்பட்டது",
    "filter_escalated": "தீவிரப்படுத்தப்பட்டது",
    "filter_closed": "மூடப்பட்டது",
    "card_log_new_title": "புதிய புகாரைப் பதிவுசெய்க",
    "card_log_new_sub": "உங்கள் பகுதியில் சிக்கலைப் புகாரளிக்கவும். முகவரியை நிரப்ப GPS ஐப் பயன்படுத்தவும்.",
    "card_log_new_btn": "தொடங்கவும்",
    "card_view_complaints_title": "என் புகார்களைப் பார்க்கவும்",
    "card_view_complaints_sub": "புகார் முன்னேற்றம் மற்றும் தீர்வு நிலையை கண்காணிக்கவும்.",
    "card_view_complaints_btn": "வரலாற்றைக் காண்க",
    "btn_cancel": "ரத்துசெய்",
    "btn_update": "புதுப்பி",
    "btn_assign": "ஒதுக்கு",
    "btn_track": "கண்காணிக்கவும்",
    "btn_view_resolution": "தீர்வை பார்க்கவும்",
    "home_portal_title": "AI-இயங்கும் பொதுமக்கள் குறைதீர்க்கும் மேலாண்மை அமைப்பு",
    "home_tagline": "உங்கள் குரல், எங்கள் கடமை",
    "home_dept_login": "துறை உள்நுழைவு",
    "home_hero_badge": "குடிமக்கள் குறைதீர்ப்பு சேவைகள்",
    "home_hero_title": "உங்கள் புகாரை இங்கே பதிவு செய்யவும்",
    "home_hero_subtitle": "நகராட்சி மற்றும் அரசுத் துறைகள் சார்ந்தது",
    "home_hero_desc": "நகராட்சி அதிகாரிகளிடம் நேரடியாக புகார் பதிவு செய்யுங்கள். AI தானியங்கி வகைப்பாடு, வார்டு அதிகாரி ஒதுக்கீடு மற்றும் நிகழ்நேர கண்காணிப்பு.",
    "home_file_btn": "புகார் பதிவு செய்க",
    "home_register_btn": "குடிமக்கள் பதிவு",
    "home_track_title": "உங்கள் புகாரைக் கண்காணிக்கவும்",
    "home_track_placeholder": "எ.கா: GRV-2026-000001",
    "home_track_btn": "நிலையைக் காண்க",
    "home_stats_title": "நேரடி குறைதீர்ப்பு புள்ளிவிவரங்கள்",
    "home_stat_total": "மொத்தம் பதிவு செய்யப்பட்டவை",
    "home_stat_pending": "பரிசீலனையில் உள்ளவை",
    "home_stat_ongoing": "பணி செயல்பாட்டில் உள்ளது",
    "home_stat_resolved": "தீர்க்கப்பட்ட புகார்கள்",
    "home_stat_rate": "தீர்வு விகிதம்",
    "home_services_title": "குடிமை சேவை பிரிவுகள்",
    "home_services_subtitle": "உள்ளூர் பிரச்சினைகளைப் புகாரளிக்க பொருத்தமான பிரிவைத் தேர்ந்தெடுக்கவும்",
    "home_cat_road": "சாலைகள் மற்றும் நடைபாதைகள்",
    "home_cat_road_desc": "குழிகள், சேதமடைந்த சாலைகள், உடைந்த நடைபாதைகள்",
    "home_cat_water": "குடிநீர் வழங்கல்",
    "home_cat_water_desc": "குழாய் கசிவுகள், அசுத்தமான குடிநீர், குறைந்த அழுத்தம்",
    "home_cat_drain": "வடிகால் மற்றும் கழிவுநீர்",
    "home_cat_drain_desc": "திறந்த சாக்கடை, அடைப்புகள், கழிவுநீர் தேங்குதல்",
    "home_cat_garbage": "திடக்கழிவு மற்றும் சுகாதாரம்",
    "home_cat_garbage_desc": "குப்பைக் குவியல்கள், பொதுக் கழிவுகள், துப்புரவு கோரிக்கைகள்",
    "home_cat_light": "தெரு விளக்குகள்",
    "home_cat_light_desc": "பழுதடைந்த தெருவிளக்குகள், இருண்ட பகுதிகள், உடைந்த கம்பங்கள்",
    "home_how_title": "இது எவ்வாறு இயங்குகிறது",
    "home_how_subtitle": "புகார் பதிவு முதல் சரிபார்க்கப்பட்ட தீர்வு வரை 4 எளிய படிகள்",
    "home_step1_title": "1. புகார் பதிவு",
    "home_step1_desc": "GPS இருப்பிடத்துடன் பிரச்சினையின் புகைப்படத்தைப் பதிவேற்றவும்.",
    "home_step2_title": "2. AI வகைப்படுத்தல்",
    "home_step2_desc": "AI தானாக வகைப்படுத்தி வார்டு அதிகாரிக்கு SLA ஒதுக்குகிறது.",
    "home_step3_title": "3. ஒப்பந்ததாரர் பழுதுபார்ப்பு",
    "home_step3_desc": "ஒப்பந்ததாரர் பழுதுநீக்கி ஆதாரப் புகைப்படங்களைப் பதிவேற்றுகிறார்.",
    "home_step4_title": "4. குடிமக்கள் சரிபார்ப்பு",
    "home_step4_desc": "அதிகாரி ஆய்வு செய்து முடிக்கிறார், குடிமக்கள் மதிப்பீடு வழங்கலாம்.",
    "home_helpline_title": "24x7 உதவி எண் மற்றும் ஆதரவு",
    "home_helpline_tollfree": "இலவச உதவி எண்: 1902 / 1800-425-0000",
    "home_helpline_email": "grievances@karnataka.gov.in",
    "home_helpline_sub": "அனைத்து வார்டுகளிலும் குடிமக்கள் குறைதீர்ப்புக்கு 24 மணி நேரமும் செயல்படுகிறது."
  }
};

class I18nManager {
    constructor() {
        this.currentLang = this.normalizeLangCode(localStorage.getItem('preferred_language') || 'en');
        // Immediately load embedded dictionary synchronously so UI is never blank
        this.translations = Object.assign({}, EMBEDDED_I18N[this.currentLang] || EMBEDDED_I18N['en']);
        this.loaded = true;
    }

    normalizeLangCode(code) {
        if (!code) return 'en';
        const c = code.toString().trim().toLowerCase();
        if (c === 'kn' || c === 'ka' || c.startsWith('kan')) return 'kn';
        if (c === 'hi' || c.startsWith('hin')) return 'hi';
        if (c === 'te' || c.startsWith('tel')) return 'te';
        if (c === 'ta' || c.startsWith('tam')) return 'ta';
        return 'en';
    }

    async init() {
        await this.loadLanguage(this.currentLang);
        this.applyToPage();
    }

    async loadLanguage(lang) {
        this.currentLang = this.normalizeLangCode(lang);
        localStorage.setItem('preferred_language', this.currentLang);

        // 1. Instantly use embedded dictionary (zero latency, zero fetch failure)
        this.translations = Object.assign({}, EMBEDDED_I18N[this.currentLang] || EMBEDDED_I18N['en']);

        // 2. Also attempt to fetch updated external JSON if served over HTTP/HTTPS
        if (window.location.protocol.startsWith('http')) {
            const isSubfolder = window.location.pathname.includes('/admin/') || 
                                window.location.pathname.includes('/citizen/') || 
                                window.location.pathname.includes('/officer/') || 
                                window.location.pathname.includes('/representative/') || 
                                window.location.pathname.includes('/vendor/');
                                
            const prefix = isSubfolder ? '../' : './';
            const tryPaths = [
                `${prefix}static/i18n/${this.currentLang}.json`,
                `${prefix}i18n/${this.currentLang}.json`
            ];

            for (const path of tryPaths) {
                try {
                    const res = await fetch(path);
                    if (res.ok) {
                        const externalData = await res.json();
                        Object.assign(this.translations, externalData);
                        break;
                    }
                } catch (err) {
                    // Safe to ignore because embedded dictionary is already active
                }
            }
        }

        this.loaded = true;
    }

    get(key) {
        if (!key) return '';
        if (this.translations && Object.prototype.hasOwnProperty.call(this.translations, key)) {
            return this.translations[key];
        }
        return key;
    }

    async setLanguage(lang) {
        await this.loadLanguage(lang);
        this.applyToPage();
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: this.currentLang } }));
    }

    getCurrentLanguage() {
        return this.currentLang;
    }

    applyToPage() {
        try {
            document.documentElement.lang = this.currentLang;
        } catch (e) {}

        // Handle elements with data-i18n-key or data-i18n
        document.querySelectorAll('[data-i18n-key], [data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n-key') || el.getAttribute('data-i18n');
            if (this.translations && Object.prototype.hasOwnProperty.call(this.translations, key)) {
                const translated = this.translations[key];
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    if (el.hasAttribute('placeholder')) {
                        el.setAttribute('placeholder', translated);
                    } else {
                        el.value = translated;
                    }
                } else {
                    const icon = el.querySelector('i, svg, img');
                    const badge = el.querySelector('.badge');
                    if (icon && badge) {
                        el.innerHTML = `${icon.outerHTML} ${translated} ${badge.outerHTML}`;
                    } else if (icon) {
                        el.innerHTML = `${icon.outerHTML} ${translated}`;
                    } else if (badge) {
                        el.innerHTML = `${translated} ${badge.outerHTML}`;
                    } else {
                        el.textContent = translated;
                    }
                }
            }
        });

        // Handle placeholder attributes explicitly
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (this.translations && Object.prototype.hasOwnProperty.call(this.translations, key)) {
                el.setAttribute('placeholder', this.translations[key]);
            }
        });

        // Sync dropdown selectors (case-insensitive)
        document.querySelectorAll('.i18n-lang-select, #navLangSelect, #appLangSelect, #indexLangSelect, #govtLangSelect').forEach(select => {
            if (!select || !select.options) return;
            for (let opt of select.options) {
                if (this.normalizeLangCode(opt.value) === this.currentLang) {
                    select.value = opt.value;
                    break;
                }
            }
        });
    }

    initLanguageSelect(selectElementId) {
        const selector = selectElementId ? `.${selectElementId}, #${selectElementId}` : '.i18n-lang-select';
        document.querySelectorAll(selector).forEach(select => {
            if (!select || select._i18nBound) return;
            select._i18nBound = true;
            for (let opt of select.options) {
                if (this.normalizeLangCode(opt.value) === this.currentLang) {
                    select.value = opt.value;
                    break;
                }
            }
            select.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        });
    }
}

window.i18n = new I18nManager();

// Delegated change listener guarantees dynamically injected dropdowns in navbars always trigger language change
document.addEventListener('change', (e) => {
    if (e.target && (e.target.classList.contains('i18n-lang-select') || ['appLangSelect', 'navLangSelect', 'indexLangSelect', 'govtLangSelect'].includes(e.target.id))) {
        if (window.i18n) {
            window.i18n.setLanguage(e.target.value);
        } else {
            localStorage.setItem('preferred_language', e.target.value);
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    window.i18n.init();
    window.i18n.initLanguageSelect('govtLangSelect');
    window.i18n.initLanguageSelect('appLangSelect');
    window.i18n.initLanguageSelect('navLangSelect');
    window.i18n.initLanguageSelect('indexLangSelect');
});
