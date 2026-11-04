let currentComplaintsList = [];

document.addEventListener("DOMContentLoaded", () => {
    if (typeof loadNavbar === 'function') {
        loadNavbar('navbar-placeholder', { rootPath: '../', activeLink: 'citizen' });
    }

    loadMyComplaints();
    loadNotificationHistory();
    loadPreferences();

    window.addEventListener('languageChanged', () => {
        if (window.i18n) window.i18n.applyToPage();
    });

    // Check URL parameters for interactive action links
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get("action");
    const token = urlParams.get("token");

    if (action === "not_solved" && token) {
        validateTokenAndOpenReopen(token);
    } else if (action === "solved" && token) {
        validateTokenAndSubmitSolved(token);
    }

    const prefForm = document.getElementById("preferencesForm");
    if (prefForm) {
        prefForm.addEventListener("submit", savePreferences);
    }

    const quickInput = document.getElementById("quickTrackInput");
    if (quickInput) {
        quickInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                trackFromInput();
            }
        });
    }

    const trackParam = urlParams.get("track") || urlParams.get("complaintId");
    if (trackParam) {
        setTimeout(() => openTrackingModal(trackParam), 300);
    }
});

async function loadMyComplaints() {
    const tableBody = document.getElementById("complaintsTableBody");
    if (!tableBody) return;

    try {
        const complaints = await API.get('/complaints/my');
        currentComplaintsList = complaints || [];

        if (!complaints || complaints.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No complaints filed yet. Click "+ Report New Problem" to file your first complaint.</td></tr>`;
            renderRecentNotificationsFromComplaints([]);
            return;
        }

        tableBody.innerHTML = complaints.map(c => {
            const ref = c.complaintRef || `GRV-2026-${String(c.complaintId).padStart(6, '0')}`;
            const status = c.status || 'RECEIVED';
            const updatedDate = c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today';
            
            // Calculate SLA countdown
            let slaHtml = `<span class="sla-timer">48h SLA Target</span>`;
            if (c.slaDeadline) {
                const deadline = new Date(c.slaDeadline);
                const diffMs = deadline - new Date();
                const diffHours = Math.round(diffMs / (1000 * 60 * 60));

                if (status === 'RESOLVED' || status === 'CLOSED') {
                    slaHtml = `<span class="sla-timer text-success bg-light border border-success"><i class="bi bi-check-circle me-1"></i> Completed</span>`;
                } else if (diffHours < 0) {
                    slaHtml = `<span class="sla-timer sla-breached"><i class="bi bi-exclamation-octagon me-1"></i> SLA Breached (${Math.abs(diffHours)}h overdue)</span>`;
                } else {
                    slaHtml = `<span class="sla-timer"><i class="bi bi-clock me-1"></i> ${diffHours}h left</span>`;
                }
            }

            let actionBtn = `
                <button class="btn btn-sm btn-primary me-1 fw-semibold shadow-sm" onclick="openTrackingModal('${c.complaintId}')">
                    <i class="bi bi-geo-alt-fill me-1"></i>Track
                </button>
            `;
            if (status === 'RESOLVED') {
                actionBtn += `
                    <button class="btn btn-sm btn-success me-1 fw-semibold" onclick="openResolutionModal('${c.complaintId}', '${ref}', '${escapeHtml(c.resolutionNote || '')}')">View Resolution</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="openReopenModal('${c.complaintId}')">Reopen</button>
                `;
            } else if (status === 'REOPENED' || status === 'REOPEN_REQUEST') {
                actionBtn += `<span class="badge bg-danger-subtle text-danger border border-danger ms-1">Reopened</span>`;
            }

            let aiBadge = '';
            if (c.severityScore || c.aiSeverityScore) {
                const score = c.aiSeverityScore || c.severityScore;
                const priority = c.priority || c.aiPriority || 'MEDIUM';
                let bgClass = 'bg-primary';
                if (priority === 'CRITICAL') bgClass = 'bg-danger';
                else if (priority === 'HIGH') bgClass = 'bg-warning text-dark';
                else if (priority === 'LOW') bgClass = 'bg-info text-dark';

                const reasoning = c.aiAnalysisReasoning ? escapeHtml(c.aiAnalysisReasoning) : 'Auto-assessed priority & severity score.';
                aiBadge = `<span class="badge ${bgClass} ms-1" title="${reasoning}" data-bs-toggle="tooltip"><i class="bi bi-cpu-fill me-1"></i>AI ${priority} (${score}/10)</span>`;
            }

            return `
                <tr>
                    <td><strong class="text-primary">${ref}</strong></td>
                    <td>
                        <div class="fw-bold">${escapeHtml(c.title || '')} ${aiBadge}</div>
                        <small class="text-muted">${escapeHtml(c.categoryName || 'General Civic')}</small>
                    </td>
                    <td><span class="badge-status badge-${status}">${status.replace('_', ' ')}</span></td>
                    <td><small class="text-muted">${updatedDate}</small></td>
                    <td>${slaHtml}</td>
                    <td>${actionBtn}</td>
                </tr>
            `;
        }).join('');

        if (window.i18n) window.i18n.applyToPage();
        renderRecentNotificationsFromComplaints(complaints);
    } catch (err) {
        console.error(err);
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-danger">Failed to load complaints: ${err.message}</td></tr>`;
    }
}

function renderRecentNotificationsFromComplaints(complaints) {
    const container = document.getElementById("recentNotificationsStream");
    if (!container) return;

    if (!complaints || complaints.length === 0) {
        container.innerHTML = `<div class="alert alert-secondary text-center">No recent notifications available.</div>`;
        return;
    }

    const notifications = [];
    complaints.forEach(c => {
        const ref = c.complaintRef || `GRV-2026-${String(c.complaintId).padStart(6, '0')}`;
        notifications.push({
            id: c.complaintId,
            ref: ref,
            title: c.title,
            status: c.status,
            date: c.updatedAt || c.createdAt,
            note: c.resolutionNote || `Your complaint is currently in ${c.status} status.`
        });
    });

    container.innerHTML = notifications.map(n => `
        <div class="notification-card">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <span class="badge-status badge-${n.status} me-2">${n.status}</span>
                    <strong class="text-dark">${n.ref}</strong> — ${escapeHtml(n.title)}
                    <p class="mb-0 text-muted small mt-1">${escapeHtml(n.note)}</p>
                </div>
                <button class="btn btn-sm btn-primary ms-3" onclick="loadMyComplaints()">View Complaint</button>
            </div>
        </div>
    `).join('');
}

async function loadPreferences() {
    try {
        const prefs = await API.get('/notifications/preferences');
        if (!prefs) return;

        document.getElementById("prefStatusUpdates").checked = prefs.statusUpdates !== false;
        document.getElementById("prefSubmissionConfirmation").checked = prefs.submissionConfirmation !== false;
        document.getElementById("prefResolutionNotification").checked = prefs.resolutionNotification !== false;
        document.getElementById("prefSlaNotifications").checked = prefs.slaNotifications !== false;
        document.getElementById("prefReopeningUpdates").checked = prefs.reopeningUpdates !== false;
        document.getElementById("prefPublicAnnouncements").checked = prefs.publicAnnouncements !== false;
        document.getElementById("prefPromotionalEmails").checked = Boolean(prefs.promotionalEmails);
    } catch (err) {
        console.warn("Preferences load error:", err);
    }
}

async function savePreferences(e) {
    e.preventDefault();
    try {
        const body = {
            statusUpdates: document.getElementById("prefStatusUpdates").checked,
            submissionConfirmation: document.getElementById("prefSubmissionConfirmation").checked,
            resolutionNotification: document.getElementById("prefResolutionNotification").checked,
            slaNotifications: document.getElementById("prefSlaNotifications").checked,
            reopeningUpdates: document.getElementById("prefReopeningUpdates").checked,
            publicAnnouncements: document.getElementById("prefPublicAnnouncements").checked,
            promotionalEmails: document.getElementById("prefPromotionalEmails").checked
        };

        await API.put('/notifications/preferences', body);
        ui.success("Notification preferences saved successfully!");
    } catch (err) {
        ui.error("Failed to save preferences: " + err.message);
    }
}

async function loadNotificationHistory() {
    const body = document.getElementById("historyTableBody");
    if (!body) return;

    try {
        const logs = await API.get('/notifications/my');
        if (!logs || logs.length === 0) {
            body.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No notification logs recorded yet.</td></tr>`;
            return;
        }

        body.innerHTML = logs.map(l => {
            const dateStr = l.sentAt ? new Date(l.sentAt).toLocaleString() : 'Recent';
            const statusBadge = l.status === 'DELIVERED' ? '<span class="badge bg-success">Delivered</span>' : '<span class="badge bg-danger">Failed</span>';

            return `
                <tr>
                    <td><small>${dateStr}</small></td>
                    <td><span class="badge bg-secondary">${l.notificationType}</span></td>
                    <td><strong>${l.complaintRef || '-'}</strong></td>
                    <td>${escapeHtml(l.subject || '')}</td>
                    <td>${statusBadge}</td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.warn("Notification history load error:", err);
    }
}

function openResolutionModal(id, ref, note) {
    document.getElementById("resolutionComplaintId").value = id;
    document.getElementById("resModalRef").textContent = ref;
    document.getElementById("resModalNote").textContent = note || "Work verified complete by designated officer.";
    
    const modal = new bootstrap.Modal(document.getElementById("resolutionModal"));
    modal.show();
}

function openReopenModal(id) {
    document.getElementById("reopenComplaintId").value = id;
    document.getElementById("reopenReasonInput").value = "";
    
    const modal = new bootstrap.Modal(document.getElementById("reopenModal"));
    modal.show();
}

function openReopenModalFromResolution() {
    const id = document.getElementById("resolutionComplaintId").value;
    const resModal = bootstrap.Modal.getInstance(document.getElementById("resolutionModal"));
    if (resModal) resModal.hide();
    
    openReopenModal(id);
}

async function submitReopenRequest() {
    const id = document.getElementById("reopenComplaintId").value;
    const reason = document.getElementById("reopenReasonInput").value.trim();

    if (!reason) {
        ui.error("Please provide a reason for reopening this complaint.");
        return;
    }

    try {
        ui.showLoader("Submitting reopening request...");
        await API.post(`/complaints/${id}/reopen`, { reason: reason });
        ui.hideLoader();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById("reopenModal"));
        if (modal) modal.hide();

        ui.success("Reopening request submitted! Responsible officer notified.");
        loadMyComplaints();
    } catch (err) {
        ui.hideLoader();
        ui.error("Failed to reopen complaint: " + err.message);
    }
}

async function submitFeedback(feedback, overrideId) {
    const id = overrideId || document.getElementById("resolutionComplaintId")?.value;
    if (!id) return;
    try {
        await API.post(`/complaints/${id}/feedback`, { feedback: feedback, rating: 5 });
        const modal = bootstrap.Modal.getInstance(document.getElementById("resolutionModal"));
        if (modal) modal.hide();

        ui.success("Thank you for your feedback!");
        loadMyComplaints();
    } catch (err) {
        ui.error("Failed to record feedback: " + err.message);
    }
}

async function validateTokenAndOpenReopen(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/action-token?token=${encodeURIComponent(token)}`);
        const data = await response.json();
        if (data.valid && data.complaintId) {
            openReopenModal(data.complaintId);
        }
    } catch (e) {
        console.warn("Token validation failed", e);
    }
}

async function validateTokenAndSubmitSolved(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/action-token?token=${encodeURIComponent(token)}`);
        const data = await response.json();
        if (data.valid && data.complaintId) {
            await API.post(`/complaints/${data.complaintId}/feedback`, { feedback: 'SOLVED', rating: 5 });
            ui.success("Issue marked as SOLVED! Thank you.");
            loadMyComplaints();
        }
    } catch (e) {
        console.warn("Token validation failed", e);
    }
}

function viewComplaintDetails(id) {
    openTrackingModal(id);
}

function trackFromInput() {
    const val = document.getElementById("quickTrackInput")?.value?.trim();
    if (!val) {
        if (typeof ui !== 'undefined' && ui.error) {
            ui.error("Please enter a Complaint Reference (e.g. GRV-2026-000001) or ID #");
        } else {
            alert("Please enter a Complaint Reference or ID");
        }
        return;
    }
    openTrackingModal(val);
}

function formatImageSrc(imgData) {
    if (!imgData) return null;
    if (imgData.startsWith("data:image") || imgData.startsWith("http")) {
        return imgData;
    }
    return `data:image/jpeg;base64,${imgData}`;
}

async function openTrackingModal(idOrRef) {
    const modalEl = document.getElementById('trackingModal');
    if (!modalEl) return;
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();

    const subtitleEl = document.getElementById('trackingRefSubtitle');
    const bodyEl = document.getElementById('trackingModalBody');

    if (subtitleEl) subtitleEl.innerText = `Tracking #${idOrRef}...`;
    if (bodyEl) {
        bodyEl.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <div class="mt-2 text-muted fw-semibold">Fetching live complaint tracking status...</div>
            </div>
        `;
    }

    try {
        let complaint = null;
        const cleanVal = String(idOrRef).trim().replace(/^#/, '');

        // Check currentComplaintsList cache first
        complaint = currentComplaintsList.find(c => 
            String(c.complaintId) === cleanVal || 
            (c.complaintRef && c.complaintRef.toLowerCase() === cleanVal.toLowerCase())
        );

        // Fetch live enriched complaint with contractor assignment and anti-false progress evidence
        try {
            if (/^\d+$/.test(cleanVal)) {
                const fresh = await API.get(`/complaints/${cleanVal}`);
                if (fresh) complaint = fresh;
            } else {
                const fresh = await API.get(`/complaints/ref/${encodeURIComponent(cleanVal)}`);
                if (fresh) complaint = fresh;
            }
        } catch (apiErr) {
            console.warn("API lookup fallback:", apiErr);
            if (!complaint && /^\d+$/.test(cleanVal)) {
                complaint = await API.get(`/complaints/ref/${encodeURIComponent(cleanVal)}`).catch(() => null);
            }
        }

        if (!complaint) {
            if (bodyEl) {
                bodyEl.innerHTML = `
                    <div class="alert alert-warning text-center my-4 py-4 rounded-3 border">
                        <i class="bi bi-search fs-1 d-block mb-2 text-warning"></i>
                        <h6 class="fw-bold">Complaint Not Found</h6>
                        <p class="small text-muted mb-0">No complaint could be found matching reference or ID "<strong>${escapeHtml(String(idOrRef))}</strong>".</p>
                    </div>
                `;
            }
            if (subtitleEl) subtitleEl.innerText = 'Not found';
            return;
        }

        renderTrackingDetails(complaint);
    } catch (err) {
        console.error("Error opening tracking modal:", err);
        if (bodyEl) {
            bodyEl.innerHTML = `
                <div class="alert alert-danger text-center my-4 py-4 rounded-3 border">
                    <i class="bi bi-exclamation-triangle-fill fs-1 d-block mb-2 text-danger"></i>
                    <h6 class="fw-bold">Unable to Load Tracking Data</h6>
                    <p class="small mb-0">${escapeHtml(err.message || 'Server error occurred while fetching tracking details.')}</p>
                </div>
            `;
        }
    }
}

function renderTrackingDetails(c) {
    const ref = c.complaintRef || `GRV-2026-${String(c.complaintId).padStart(6, '0')}`;
    const subtitleEl = document.getElementById('trackingRefSubtitle');
    if (subtitleEl) {
        subtitleEl.innerHTML = `<span class="badge bg-warning text-dark me-2">${ref}</span> Last Updated: ${c.updatedAt ? new Date(c.updatedAt).toLocaleString() : 'Recently'}`;
    }

    const bodyEl = document.getElementById('trackingModalBody');
    if (!bodyEl) return;

    const status = (c.status || 'RECEIVED').toUpperCase();
    
    // Calculate 5-Stage Stepper step
    let currentStep = 1;
    if (status === 'CLOSED') {
        currentStep = 5;
    } else if (status === 'RESOLVED' || status === 'COMPLETED' || status === 'OFFICER_VERIFICATION') {
        currentStep = 4;
    } else if (status === 'IN_PROGRESS') {
        currentStep = 3;
    } else if (status === 'ASSIGNED' || status === 'VENDOR_ACCEPTED' || c.assignedVendorName) {
        currentStep = 2;
    } else {
        currentStep = 1;
    }

    // SLA Watchdog
    let slaBadge = `<span class="badge bg-light text-dark border">48h Target</span>`;
    if (c.slaDeadline) {
        const deadline = new Date(c.slaDeadline);
        const diffMs = deadline - new Date();
        const hoursRemaining = Math.round(diffMs / (1000 * 60 * 60));
        if (status === 'RESOLVED' || status === 'CLOSED') {
            slaBadge = `<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i> SLA Met (${c.slaTargetHours || 48}h)</span>`;
        } else if (hoursRemaining < 0) {
            slaBadge = `<span class="badge bg-danger"><i class="bi bi-exclamation-triangle-fill me-1"></i> SLA Breached (${Math.abs(hoursRemaining)}h overdue)</span>`;
        } else {
            slaBadge = `<span class="badge bg-info text-dark"><i class="bi bi-clock me-1"></i> ${hoursRemaining}h remaining</span>`;
        }
    }

    const initialImg = formatImageSrc(c.evidenceImageData);
    const startImg = formatImageSrc(c.startEvidenceImageData);
    const compImg = formatImageSrc(c.completionEvidenceImageData);

    // Contractor Assignment Card
    let contractorHtml = '';
    if (c.assignedVendorName || c.assignedVendorUsername) {
        const vendorName = c.assignedVendorName || c.assignedVendorUsername;
        const vendorDesig = c.assignedVendorDesignation || 'Designated Public Works Contractor';
        const assignedTime = c.assignedAt ? new Date(c.assignedAt).toLocaleString() : 'Assigned by Officer';
        const assignStatus = c.assignmentStatus || 'IN_PROGRESS';
        
        contractorHtml = `
            <div class="card border border-primary-subtle bg-primary-subtle bg-opacity-10 rounded-3 p-3 mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="fw-bold text-primary small"><i class="bi bi-shield-check me-1"></i> Assigned Contractor & Field Agency</span>
                    <span class="badge bg-primary">${assignStatus}</span>
                </div>
                <div class="d-flex align-items-center gap-3">
                    <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0" style="width:44px; height:44px; font-size:1.2rem; font-weight:bold;">
                        <i class="bi bi-person-gear"></i>
                    </div>
                    <div>
                        <div class="fw-bold text-dark">${escapeHtml(vendorName)}</div>
                        <div class="small text-muted">${escapeHtml(vendorDesig)} • Assigned: ${assignedTime}</div>
                        ${c.assignmentNotes ? `<div class="small text-dark mt-1 fst-italic">"${escapeHtml(c.assignmentNotes)}"</div>` : ''}
                    </div>
                </div>
            </div>
        `;
    } else {
        contractorHtml = `
            <div class="card border border-warning-subtle bg-warning-subtle bg-opacity-10 rounded-3 p-3 mb-3">
                <div class="d-flex align-items-center gap-3">
                    <i class="bi bi-hourglass-split text-warning fs-3 flex-shrink-0"></i>
                    <div>
                        <div class="fw-bold text-dark">Contractor Allocation in Progress</div>
                        <div class="small text-muted">Zonal officer is evaluating smart matchmaking recommendations to assign the certified field vendor for this ward.</div>
                    </div>
                </div>
            </div>
        `;
    }

    // Resolution Note Card
    let resolutionHtml = '';
    if (c.resolutionNote || status === 'RESOLVED' || status === 'CLOSED') {
        resolutionHtml = `
            <div class="alert alert-success border-success border-2 rounded-3 p-3 mb-3">
                <div class="d-flex align-items-start gap-2">
                    <i class="bi bi-patch-check-fill text-success fs-4 mt-1 flex-shrink-0"></i>
                    <div class="flex-grow-1">
                        <div class="fw-bold text-success">Official Resolution Statement</div>
                        <p class="mb-2 text-dark small">${escapeHtml(c.resolutionNote || 'The repair works have been verified and marked as resolved by the municipal supervisor.')}</p>
                        ${status === 'RESOLVED' ? `
                            <div class="d-flex gap-2 mt-2">
                                <button class="btn btn-sm btn-success fw-semibold" onclick="submitFeedbackFromTracking('${c.complaintId}', 'SOLVED')">
                                    <i class="bi bi-hand-thumbs-up me-1"></i> Confirm Solved
                                </button>
                                <button class="btn btn-sm btn-outline-danger fw-semibold" onclick="openReopenFromTracking('${c.complaintId}')">
                                    <i class="bi bi-arrow-repeat me-1"></i> Reopen Complaint
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    bodyEl.innerHTML = `
        <!-- Status Banner -->
        <div class="p-3 bg-light rounded-3 mb-3 border">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                <div>
                    <h5 class="fw-bold text-dark mb-1">${escapeHtml(c.title || 'Civic Grievance')}</h5>
                    <div class="text-muted small">
                        <i class="bi bi-tag-fill text-primary me-1"></i>${escapeHtml(c.categoryName || 'General Civic')}
                        <span class="mx-2">•</span>
                        <i class="bi bi-geo-alt-fill text-danger me-1"></i>${escapeHtml(c.location || 'Ward Location')}
                    </div>
                </div>
                <div class="text-end">
                    <span class="badge-status badge-${status} fs-6">${status.replace('_', ' ')}</span>
                    <div class="mt-1">${slaBadge}</div>
                </div>
            </div>
            <div class="small text-muted mt-2 pt-2 border-top">
                <strong>Description:</strong> ${escapeHtml(c.description || 'No description provided.')}
            </div>
        </div>

        <!-- 5-Stage Stepper -->
        <div class="card border-0 shadow-sm rounded-3 p-3 mb-3 bg-white">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="fw-bold small text-uppercase text-muted"><i class="bi bi-diagram-3-fill me-1 text-primary"></i> Live Progression Pipeline</span>
                <span class="small fw-semibold text-primary">Stage ${currentStep} of 5</span>
            </div>
            <div class="stepper-wrapper">
                <div class="stepper-item ${currentStep > 1 ? 'completed' : (currentStep === 1 ? 'active' : '')}">
                    <div class="stepper-circle">${currentStep > 1 ? '<i class="bi bi-check-lg"></i>' : '1'}</div>
                    <div class="stepper-label">1. Reported</div>
                    <small class="text-muted" style="font-size:0.68rem;">AI Triaged</small>
                </div>
                <div class="stepper-item ${currentStep > 2 ? 'completed' : (currentStep === 2 ? 'active' : '')}">
                    <div class="stepper-circle">${currentStep > 2 ? '<i class="bi bi-check-lg"></i>' : '2'}</div>
                    <div class="stepper-label">2. Assigned</div>
                    <small class="text-muted" style="font-size:0.68rem;">Vendor Designated</small>
                </div>
                <div class="stepper-item ${currentStep > 3 ? 'completed' : (currentStep === 3 ? 'active' : '')}">
                    <div class="stepper-circle">${currentStep > 3 ? '<i class="bi bi-check-lg"></i>' : '3'}</div>
                    <div class="stepper-label">3. In Progress</div>
                    <small class="text-muted" style="font-size:0.68rem;">Arrival GPS Proof</small>
                </div>
                <div class="stepper-item ${currentStep > 4 ? 'completed' : (currentStep === 4 ? 'active' : '')}">
                    <div class="stepper-circle">${currentStep > 4 ? '<i class="bi bi-check-lg"></i>' : '4'}</div>
                    <div class="stepper-label">4. Repaired</div>
                    <small class="text-muted" style="font-size:0.68rem;">AI Vision QA</small>
                </div>
                <div class="stepper-item ${currentStep >= 5 ? 'completed' : ''}">
                    <div class="stepper-circle">${currentStep >= 5 ? '<i class="bi bi-check-lg"></i>' : '5'}</div>
                    <div class="stepper-label">5. Closed</div>
                    <small class="text-muted" style="font-size:0.68rem;">Citizen Verified</small>
                </div>
            </div>
        </div>

        <!-- Contractor Card -->
        ${contractorHtml}

        <!-- Resolution Note -->
        ${resolutionHtml}

        <!-- Photographic Proof & Audit Gallery -->
        <div class="card border-0 shadow-sm rounded-3 p-3 bg-white">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold mb-0 text-dark"><i class="bi bi-camera-fill text-primary me-2"></i> Photographic Proof & Audit Gallery</h6>
                <span class="badge bg-secondary-subtle text-secondary small">Anti-False Progression Guard</span>
            </div>
            <div class="row g-3">
                <!-- 1. Citizen Initial Photo -->
                <div class="col-md-4">
                    <div class="border rounded-3 p-2 h-100 bg-light">
                        <div class="fw-semibold small mb-1 text-secondary"><i class="bi bi-file-earmark-image me-1"></i> Initial Citizen Evidence</div>
                        ${initialImg ? `
                            <img src="${initialImg}" class="img-fluid rounded border mb-2" style="max-height:140px; width:100%; object-fit:cover; cursor:pointer;" onclick="window.open(this.src)" title="Click to view full image">
                            <div class="small text-muted" style="font-size:0.72rem;">Uploaded at complaint creation</div>
                        ` : `
                            <div class="p-3 text-center rounded border border-dashed bg-white text-muted" style="min-height:140px; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                                <i class="bi bi-image text-muted fs-3 mb-1"></i>
                                <span style="font-size:0.75rem;">No initial photo attached</span>
                            </div>
                        `}
                    </div>
                </div>

                <!-- 2. Contractor Arrival Photo (Check-in) -->
                <div class="col-md-4">
                    <div class="border rounded-3 p-2 h-100 bg-light">
                        <div class="fw-semibold small mb-1 text-primary"><i class="bi bi-geo-alt-fill me-1"></i> Contractor Arrival Proof</div>
                        ${startImg ? `
                            <img src="${startImg}" class="img-fluid rounded border mb-2" style="max-height:140px; width:100%; object-fit:cover; cursor:pointer;" onclick="window.open(this.src)" title="Click to view full image">
                            <div class="small text-success fw-bold" style="font-size:0.72rem;">
                                <i class="bi bi-check-circle-fill me-1"></i> Verified On-Site Check-in
                                ${c.assignmentLatitude ? `<div class="text-muted fw-normal">GPS: ${Number(c.assignmentLatitude).toFixed(4)}, ${Number(c.assignmentLongitude).toFixed(4)}</div>` : ''}
                            </div>
                        ` : `
                            <div class="p-3 text-center rounded border border-dashed bg-white text-muted" style="min-height:140px; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                                <i class="bi bi-geo text-muted fs-3 mb-1"></i>
                                <span style="font-size:0.75rem;">Pending arrival check-in photo</span>
                            </div>
                        `}
                    </div>
                </div>

                <!-- 3. Contractor Completion Photo (Repaired) -->
                <div class="col-md-4">
                    <div class="border rounded-3 p-2 h-100 bg-light">
                        <div class="fw-semibold small mb-1 text-success"><i class="bi bi-check2-circle me-1"></i> Completed Repair Proof</div>
                        ${compImg ? `
                            <img src="${compImg}" class="img-fluid rounded border mb-2" style="max-height:140px; width:100%; object-fit:cover; cursor:pointer;" onclick="window.open(this.src)" title="Click to view full image">
                            <div class="small text-success fw-bold" style="font-size:0.72rem;">
                                <i class="bi bi-cpu-fill text-primary me-1"></i> AI QA Score: ${c.aiVerificationScore || 95}%
                                ${c.aiVerificationNote ? `<div class="text-muted fw-normal">${escapeHtml(c.aiVerificationNote)}</div>` : ''}
                            </div>
                        ` : `
                            <div class="p-3 text-center rounded border border-dashed bg-white text-muted" style="min-height:140px; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                                <i class="bi bi-tools text-muted fs-3 mb-1"></i>
                                <span style="font-size:0.75rem;">Pending repair completion photo</span>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function submitFeedbackFromTracking(id, feedback) {
    const modalEl = document.getElementById('trackingModal');
    if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    }
    submitFeedback(feedback, id);
}

function openReopenFromTracking(id) {
    const modalEl = document.getElementById('trackingModal');
    if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    }
    openReopenModal(id);
}

function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

window.openTrackingModal = openTrackingModal;
window.viewComplaintDetails = openTrackingModal;
window.trackFromInput = trackFromInput;
window.loadMyComplaints = loadMyComplaints;

