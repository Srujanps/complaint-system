let allComplaints = [];
let activeStatusFilter = 'ALL';
let priorityModal;
let remarkModal;
let workDoneModal;

document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('token') || localStorage.getItem('role') !== 'REPRESENTATIVE') {
        window.location.href = '../login.html';
        return;
    }
    loadNavbar('navbar-placeholder', { rootPath: '../', activeLink: 'representative' });

    const constituency = localStorage.getItem('constituency') || 'Your Area';
    const designation  = localStorage.getItem('designation')  || 'Representative';
    document.getElementById('repAreaLabel').textContent        = constituency;
    document.getElementById('repDesignationLabel').textContent = `${designation} Portal`;

    priorityModal = new bootstrap.Modal(document.getElementById('priorityModal'));
    remarkModal   = new bootstrap.Modal(document.getElementById('remarkModal'));
    const wdEl = document.getElementById('workDoneModal');
    if (wdEl) workDoneModal = new bootstrap.Modal(wdEl);

    window.addEventListener('languageChanged', () => {
        if (window.i18n) window.i18n.applyToPage();
    });

    loadAll();
});

async function loadAll() {
    await Promise.all([loadStats(), loadComplaints(), loadRepAiBriefing()]);
}

async function loadStats() {
    try {
        const constituency = localStorage.getItem('constituency') || '';
        const areaParam = constituency ? `?area=${encodeURIComponent(constituency)}` : '';
        const res = await apiFetch(`/representative/complaints/stats${areaParam}`, { method: 'GET' });
        if (res && res.ok) {
            const data = await res.json();
            const el = id => document.getElementById(id);
            if (el('statTotal')) el('statTotal').textContent         = data.total ?? '–';
            if (el('statPending')) el('statPending').textContent     = data.pending ?? '–';
            if (el('statInProgress')) el('statInProgress').textContent = data.inProgress ?? '–';
            if (el('statCompleted')) el('statCompleted').textContent   = data.completed ?? '–';
            if (el('statResolved')) el('statResolved').textContent   = data.resolved ?? '–';
            if (el('statEscalated')) el('statEscalated').textContent = data.escalated ?? '–';
        }
    } catch (e) { /* optional */ }
}

async function loadComplaints(overrideArea = null) {
    const constituency = overrideArea !== null ? overrideArea : (localStorage.getItem('constituency') || '');
    const tbody = document.getElementById('complaintsTableBody');
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4"><div class="spinner-border" style="color:#5c35cc"></div></td></tr>`;
    try {
        const areaParam = constituency ? `&area=${encodeURIComponent(constituency)}` : '';
        const res = await apiFetch(`/representative/complaints?page=0&size=100${areaParam}`, { method: 'GET' });
        if (res && res.ok) {
            const data = await res.json();
            allComplaints = data.content || [];
            renderTable();
        } else {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Failed to load complaints.</td></tr>`;
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Network error.</td></tr>`;
    }
}

function filterByStatus(status, btn) {
    activeStatusFilter = status;
    document.querySelectorAll('#filterTabs .btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTable();
}

function applyFilters() { renderTable(); }

function renderTable() {
    const tbody          = document.getElementById('complaintsTableBody');
    const priorityFilter = document.getElementById('priorityFilter').value;

    let list = allComplaints;
    if (activeStatusFilter !== 'ALL') {
        if (activeStatusFilter === 'RESOLVED') {
            list = list.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED');
        } else {
            list = list.filter(c => c.status === activeStatusFilter);
        }
    }
    if (priorityFilter !== 'ALL')     list = list.filter(c => (c.priority || 'MEDIUM') === priorityFilter);

    if (list.length === 0) {
        const repArea = localStorage.getItem('constituency') || 'Your Area';
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <div class="p-4 bg-light rounded border d-inline-block text-center" style="max-width: 520px;">
                        <i class="bi bi-geo-alt text-primary fs-1 d-block mb-2"></i>
                        <h6 class="fw-bold text-dark">No Public Grievances Reported in "${repArea}"</h6>
                        <p class="text-muted small mb-3">When citizens submit grievances located in or around "${repArea}", they will automatically appear here with live GPS coordinates, contractor proofs, and inspection tools.</p>
                        <button class="btn btn-sm btn-outline-primary" onclick="loadComplaints('all')"><i class="bi bi-grid me-1"></i>View All Municipal Wards</button>
                    </div>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = '';
    list.forEach(c => {
        const priority = c.priority || 'MEDIUM';
        const statusBadge = getStatusBadge(c.status);

        const hasWorkDone = !!(c.completionEvidenceImageData || c.startEvidenceImageData || ['COMPLETED', 'RESOLVED', 'CLOSED', 'IN_PROGRESS'].includes(c.status));
        const canEscalate = !['RESOLVED', 'CLOSED', 'ESCALATED'].includes(c.status);
        const canEndorse  = ['COMPLETED', 'RESOLVED'].includes(c.status);

        const actions = `
            <div class="d-flex justify-content-end gap-2 flex-wrap">
                ${hasWorkDone ? `<button class="btn btn-sm btn-success fw-bold" onclick="openWorkDoneModal(${c.complaintId})"><i class="bi bi-patch-check-fill me-1"></i>View Work Done</button>` : ''}
                <button class="btn btn-sm btn-outline-primary" onclick="openRepAiChecklistModal('${encodeURIComponent(c.title || '')}', '${encodeURIComponent(c.categoryName || '')}')"><i class="bi bi-card-checklist me-1"></i>AI Checklist</button>
                <button class="btn btn-sm btn-outline-danger" onclick="openEscalationMemoModal(${c.complaintId})"><i class="bi bi-file-earmark-text me-1"></i>AI Memo</button>
                <button class="btn btn-sm btn-outline-warning" onclick="openPriorityModal(${c.complaintId})"><i class="bi bi-flag-fill me-1"></i>Priority</button>
                <button class="btn btn-sm btn-outline-secondary" onclick="openRemarkModal(${c.complaintId})"><i class="bi bi-chat-left-text me-1"></i>Remark</button>
                ${canEscalate ? `<button class="btn btn-sm btn-outline-danger" onclick="escalate(${c.complaintId})"><i class="bi bi-exclamation-triangle me-1"></i>Escalate</button>` : ''}
                ${canEndorse ? `<button class="btn btn-sm btn-dark" onclick="endorse(${c.complaintId})"><i class="bi bi-shield-check me-1"></i>Endorse</button>` : ''}
            </div>`;

        const aiCat = c.aiCategory || c.aiCategoryName || c.categoryName || 'Unassigned';
        const aiScore = c.aiSeverity || c.aiSeverityScore || c.severityScore || 5;
        const aiLang = c.detectedLanguage ? ` | Lang: ${c.detectedLanguage.toUpperCase()}` : '';
        const aiBadge = `<div class="mt-1"><span class="badge bg-purple"><i class="bi bi-cpu-fill me-1"></i>AI Cat: ${aiCat} (${aiScore}/10${aiLang})</span></div>`;

        // Contractor / Field Work badge
        let contractorLine = '';
        if (c.assignedVendorName || c.assignedVendorUsername) {
            contractorLine = `
                <div class="small text-muted mt-1">
                    <i class="bi bi-person-badge text-primary me-1"></i>Contractor: <strong>${c.assignedVendorName || c.assignedVendorUsername}</strong>
                    ${c.workOrderNumber ? `· <span class="badge bg-light text-danger border font-monospace">${c.workOrderNumber}</span>` : ''}
                </div>`;
        }

        // On-Site Evidence Thumbnail & GPS Tag
        let workDonePreview = '';
        if (c.completionEvidenceImageData || c.status === 'COMPLETED' || c.status === 'RESOLVED') {
            workDonePreview = `
                <div class="mt-2 p-2 rounded bg-success-subtle border border-success">
                    <div class="d-flex align-items-center justify-content-between mb-1">
                        <span class="badge bg-success"><i class="bi bi-patch-check-fill me-1"></i>Work Done Proof</span>
                        ${c.aiVerificationScore ? `<span class="badge bg-dark">AI QA: ${c.aiVerificationScore}%</span>` : ''}
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        ${c.completionEvidenceImageData ? `<img src="${c.completionEvidenceImageData}" alt="Repair photo" class="rounded border" style="height:55px;width:75px;object-fit:cover;cursor:pointer" onclick="openWorkDoneModal(${c.complaintId})" title="Click to view work done proof">` : ''}
                        <div class="small">
                            <div class="text-dark fw-bold">${c.completionNotes || c.resolutionNote || 'Repair executed according to municipal specifications.'}</div>
                            ${c.completionLatitude ? `<div class="text-success" style="font-size:0.75rem"><i class="bi bi-pin-map-fill me-1"></i>Repair GPS: <strong>${c.completionLatitude}, ${c.completionLongitude}</strong></div>` : ''}
                        </div>
                    </div>
                </div>`;
        } else if (c.startEvidenceImageData || c.status === 'IN_PROGRESS') {
            workDonePreview = `
                <div class="mt-2 p-2 rounded bg-light border border-warning">
                    <div class="d-flex align-items-center justify-content-between mb-1">
                        <span class="badge bg-warning text-dark"><i class="bi bi-tools me-1"></i>Field Work In Progress</span>
                        ${c.startLatitude ? `<span class="text-muted" style="font-size:0.75rem">📍 ${c.startLatitude}, ${c.startLongitude}</span>` : ''}
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        ${c.startEvidenceImageData ? `<img src="${c.startEvidenceImageData}" alt="Site inspection photo" class="rounded border" style="height:50px;width:70px;object-fit:cover;cursor:pointer" onclick="openWorkDoneModal(${c.complaintId})">` : ''}
                        <div class="small text-muted">${c.fieldNotes || 'Field team arrived on-site with tools & equipment.'}</div>
                    </div>
                </div>`;
        }

        tbody.innerHTML += `
            <tr>
                <td class="ps-4 fw-bold">#${c.complaintId}</td>
                <td>
                    <div class="fw-bold text-dark">${c.title}</div>
                    <small class="text-muted">${c.categoryName || 'General'} · ${c.citizen ? c.citizen.fullName : (c.citizenName || '')}</small>
                    ${aiBadge}
                    ${contractorLine}
                    ${workDonePreview}
                </td>
                <td class="text-muted small">
                    <i class="bi bi-geo-alt-fill text-danger me-1"></i>${c.location || '-'}
                </td>
                <td>${statusBadge}</td>
                <td><span class="badge bg-purple">${priority}</span></td>
                <td class="pe-4">${actions}</td>
            </tr>`;
    });
    if (window.i18n) window.i18n.applyToPage();
}

function getStatusBadge(status) {
    const map = {
        CREATED:         'bg-info text-dark',
        VERIFIED:        'bg-primary text-white',
        ASSIGNED:        'bg-primary text-white',
        VENDOR_ACCEPTED: 'bg-warning text-dark',
        IN_PROGRESS:     'text-white',
        COMPLETED:       'text-white',
        RESOLVED:        'bg-success text-white',
        ESCALATED:       'bg-danger text-white',
        CLOSED:          'bg-dark text-white',
    };
    const cls = map[status] || 'bg-secondary text-white';
    let style = '';
    if (status === 'IN_PROGRESS') style = ' style="background:#ff6f00"';
    else if (status === 'COMPLETED') style = ' style="background:#6f42c1"';

    const label = status === 'COMPLETED' ? 'COMPLETED (WORK DONE)' : status.replace('_', ' ');
    return `<span class="s-badge badge ${cls}"${style}>${label}</span>`;
}

function openPriorityModal(id) {
    document.getElementById('priorityComplaintId').value  = id;
    document.getElementById('priorityComplaintLabel').textContent = `#${id}`;
    priorityModal.show();
}

async function confirmPriority(level) {
    const id = document.getElementById('priorityComplaintId').value;
    priorityModal.hide();
    ui.showLoader('Setting priority…');
    try {
        const res = await apiFetch(`/representative/complaints/${id}/priority?priority=${level}`, { method: 'PUT' });
        if (res && res.ok) { ui.success(`Priority set to ${level} for complaint #${id}`); await loadAll(); }
        else { ui.error('Failed to set priority.'); }
    } catch (e) { ui.error('Network error.'); }
    finally { ui.hideLoader(); }
}

async function escalate(id) {
    if (!confirm(`Escalate complaint #${id} for urgent attention?`)) return;
    ui.showLoader('Escalating…');
    try {
        const res = await apiFetch(`/representative/complaints/${id}/escalate`, { method: 'PUT' });
        if (res && res.ok) { ui.success(`Complaint #${id} escalated!`); await loadAll(); }
        else { ui.error('Escalation failed.'); }
    } catch (e) { ui.error('Network error.'); }
    finally { ui.hideLoader(); }
}

async function endorse(id) {
    if (!confirm(`Endorse complaint #${id} as resolved and close it?`)) return;
    ui.showLoader('Endorsing…');
    try {
        const res = await apiFetch(`/representative/complaints/${id}/endorse`, { method: 'PUT' });
        if (res && res.ok) { ui.success(`Complaint #${id} closed!`); await loadAll(); }
        else {
            const msg = res ? await res.text() : 'Failed';
            ui.error(msg || 'Endorsement failed.');
        }
    } catch (e) { ui.error('Network error.'); }
    finally { ui.hideLoader(); }
}

function openRemarkModal(id) {
    document.getElementById('remarkComplaintId').value = id;
    document.getElementById('remarkComplaintLabel').textContent = `#${id}`;
    document.getElementById('remarkText').value = '';
    remarkModal.show();
}

async function saveRemark() {
    const id = document.getElementById('remarkComplaintId').value;
    const remark = document.getElementById('remarkText').value.trim();
    if (!remark) { ui.error('Please write a remark.'); return; }
    remarkModal.hide();
    ui.showLoader('Saving remark…');
    try {
        const res = await apiFetch(`/representative/complaints/${id}/remark`, {
            method: 'PUT',
            body: JSON.stringify({ remark })
        });
        if (res && res.ok) { ui.success(`Remark saved for complaint #${id}`); await loadAll(); }
        else {
            const msg = res ? await res.text() : 'Failed';
            ui.error(msg || 'Failed to save remark.');
        }
    } catch (e) { ui.error('Network error.'); }
    finally { ui.hideLoader(); }
}

async function openRepAiChecklistModal(encTitle, encCat) {
    const title = decodeURIComponent(encTitle);
    const category = decodeURIComponent(encCat);

    document.getElementById('repAiTaskTitle').textContent = `Task Protocol: ${title} (${category})`;
    const listEl = document.getElementById('repAiStepsList');
    listEl.innerHTML = '<div class="list-group-item">Generating field checklist...</div>';

    const modal = new bootstrap.Modal(document.getElementById('repAiChecklistModal'));
    modal.show();

    try {
        const res = await apiFetch('/ai/field-checklist', {
            method: 'POST',
            body: JSON.stringify({ title, category })
        });
        if (res && res.ok) {
            const data = await res.json();
            const steps = data.inspectionSteps || [];
            listEl.innerHTML = steps.map((s, idx) => `
                <div class="list-group-item d-flex align-items-center gap-2">
                    <input class="form-check-input flex-shrink-0" type="checkbox" id="stepCheck${idx}">
                    <label class="form-check-label text-dark" for="stepCheck${idx}">${s}</label>
                </div>
            `).join('');
        }
    } catch (e) {
        listEl.innerHTML = `
            <div class="list-group-item"><input class="form-check-input me-2" type="checkbox"> Verify site coordinates & geotagged photo</div>
            <div class="list-group-item"><input class="form-check-input me-2" type="checkbox"> Perform safety barrier setup</div>
            <div class="list-group-item"><input class="form-check-input me-2" type="checkbox"> Complete field repair work & verify resolution</div>
        `;
    }
}

async function loadRepAiBriefing() {
    const textEl = document.getElementById('aiRepBriefingText');
    if (!textEl) return;
    textEl.textContent = "AI is computing constituency trends & grievance distribution...";

    try {
        const areaLabel = document.getElementById('repAreaLabel')?.textContent || '';
        const area = (areaLabel !== 'My Area') ? areaLabel : '';
        const res = await apiFetch('/ai/rep-briefing', {
            method: 'POST',
            body: JSON.stringify({ area })
        });
        if (res && res.ok) {
            const data = await res.json();
            textEl.textContent = data.briefingSummary || "Constituency grievances operating within standard SLA thresholds.";
        }
    } catch (e) {
        textEl.textContent = "Constituency grievances overview: Review open tickets requiring priority intervention.";
    }
}

async function openEscalationMemoModal(complaintId) {
    const memoText = document.getElementById('repMemoTextArea');
    if (memoText) memoText.value = "Generating official escalation memorandum for Executive Engineer...";

    const modal = new bootstrap.Modal(document.getElementById('repEscalationModal'));
    modal.show();

    try {
        const res = await apiFetch('/ai/rep-escalation-memo', {
            method: 'POST',
            body: JSON.stringify({ complaintId })
        });
        if (res && res.ok) {
            const data = await res.json();
            if (memoText) memoText.value = data.memoText || "Failed to generate memo.";
        }
    } catch (e) {
        if (memoText) memoText.value = "Error generating escalation memo. Please retry.";
    }
}

function copyEscalationMemo() {
    const memoText = document.getElementById('repMemoTextArea');
    if (memoText) {
        navigator.clipboard.writeText(memoText.value).then(() => {
            ui.success("Escalation Memorandum copied to clipboard!");
        }).catch(() => {
            memoText.select();
            document.execCommand('copy');
            ui.success("Escalation Memorandum copied to clipboard!");
        });
    }
}

function openWorkDoneModal(id) {
    const c = allComplaints.find(k => k.complaintId === id);
    if (!c) return;

    const body = document.getElementById('workDoneModalBody');
    const footer = document.getElementById('workDoneModalFooter');

    const beforeImg = c.evidenceImageData ? `<img src="${c.evidenceImageData}" class="img-fluid rounded border shadow-sm" style="max-height:220px;width:100%;object-fit:cover;">` : '<div class="p-4 bg-light rounded text-center text-muted small">No citizen image provided</div>';
    const compImg = c.completionEvidenceImageData ? `<img src="${c.completionEvidenceImageData}" class="img-fluid rounded border border-success shadow-sm" style="max-height:220px;width:100%;object-fit:cover;">` : '<div class="p-4 bg-light rounded text-center text-muted small"><i class="bi bi-clock-history d-block fs-3 mb-1 text-warning"></i>Field repair work in progress; completion photo pending</div>';

    const canEndorse = ['COMPLETED', 'RESOLVED'].includes(c.status);

    body.innerHTML = `
        <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
            <div>
                <span class="badge bg-danger font-monospace fs-6 me-2">${c.complaintRef || ('#' + c.complaintId)}</span>
                ${getStatusBadge(c.status)}
            </div>
            <div class="text-end text-muted small">
                <strong>Priority:</strong> <span class="badge bg-purple">${c.priority || 'MEDIUM'}</span>
            </div>
        </div>

        <h5 class="fw-bold text-dark mb-1">${c.title}</h5>
        <p class="text-secondary small mb-3">${c.description}</p>

        <div class="p-2 bg-light rounded border mb-3 small">
            <div class="d-flex justify-content-between flex-wrap gap-2">
                <span><i class="bi bi-geo-alt-fill text-danger me-1"></i><strong>Location:</strong> ${c.location || '-'}</span>
                <span><i class="bi bi-person-badge text-primary me-1"></i><strong>Assigned Contractor:</strong> ${c.assignedVendorName || 'Civic Works Squad'} (@${c.assignedVendorUsername || 'vendor'})</span>
                <span><i class="bi bi-file-earmark-ruled text-dark me-1"></i><strong>Work Order:</strong> <span class="font-monospace text-danger">${c.workOrderNumber || 'WO-2026-ID-' + c.complaintId}</span></span>
            </div>
        </div>

        <!-- Before vs After Comparison Grid -->
        <div class="row g-3 mb-3">
            <div class="col-md-6">
                <div class="card h-100 border">
                    <div class="card-header bg-light py-2 fw-bold small text-dark d-flex justify-content-between align-items-center">
                        <span><i class="bi bi-camera me-1 text-danger"></i> 1. Before (Reported Issue)</span>
                        <span class="badge bg-secondary">Citizen Evidence</span>
                    </div>
                    <div class="card-body p-2">
                        ${beforeImg}
                        <div class="mt-2 small text-muted">
                            <i class="bi bi-geo-alt-fill text-danger me-1"></i>${c.location || '-'}
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card h-100 border border-success">
                    <div class="card-header bg-success-subtle py-2 fw-bold small text-success d-flex justify-content-between align-items-center">
                        <span><i class="bi bi-patch-check-fill me-1 text-success"></i> 2. After (Completed Work Proof)</span>
                        ${c.aiVerificationScore ? `<span class="badge bg-success">AI QA Passed: ${c.aiVerificationScore}%</span>` : `<span class="badge bg-warning text-dark">Work In Progress</span>`}
                    </div>
                    <div class="card-body p-2">
                        ${compImg}
                        <div class="mt-2 small">
                            <div class="text-dark fw-bold">${c.completionNotes || c.resolutionNote || 'Awaiting contractor repair completion note'}</div>
                            ${c.completionLatitude ? `<div class="text-success mt-1"><i class="bi bi-pin-map-fill me-1"></i><strong>Verified Completion GPS:</strong> ${c.completionLatitude}, ${c.completionLongitude}</div>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Stage 1 Site Inspection Record (if available) -->
        ${c.startEvidenceImageData || c.startLatitude ? `
            <div class="p-3 bg-light rounded border mb-3 small">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <strong class="text-dark"><i class="bi bi-shield-check text-warning me-1"></i> Stage 1: On-Site Inspection Evidence</strong>
                    <span class="badge bg-warning text-dark">Arrival Verified</span>
                </div>
                <div class="text-muted mb-2"><strong>Field Notes:</strong> ${c.fieldNotes || 'Field crew arrived on site with safety cones & machinery.'}</div>
                <div class="d-flex align-items-center gap-3">
                    ${c.startEvidenceImageData ? `<img src="${c.startEvidenceImageData}" class="rounded border" style="height:70px;width:100px;object-fit:cover;">` : ''}
                    <div>
                        <div><strong>Site GPS Tag:</strong> 📍 ${c.startLatitude || c.latitude}, ${c.startLongitude || c.longitude}</div>
                        <div class="text-muted" style="font-size:0.75rem">Recorded via device GPS during initial field arrival.</div>
                    </div>
                </div>
            </div>
        ` : ''}
    `;

    footer.innerHTML = `
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-outline-warning" onclick="workDoneModal.hide(); openRemarkModal(${c.complaintId})"><i class="bi bi-chat-left-text me-1"></i> Add Remark</button>
        ${canEndorse ? `<button type="button" class="btn btn-success fw-bold" onclick="workDoneModal.hide(); endorse(${c.complaintId})"><i class="bi bi-shield-check me-1"></i> Endorse & Approve Work</button>` : ''}
    `;

    workDoneModal.show();
}



