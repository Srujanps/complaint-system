let allComplaints = [];
let activeStatusFilter = 'ALL';
let priorityModal;
let remarkModal;

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
        const res = await apiFetch('/representative/complaints/stats', { method: 'GET' });
        if (res && res.ok) {
            const data = await res.json();
            document.getElementById('statTotal').textContent     = data.total     ?? '–';
            document.getElementById('statPending').textContent   = data.pending   ?? '–';
            document.getElementById('statEscalated').textContent = data.escalated ?? '–';
            document.getElementById('statResolved').textContent  = data.resolved  ?? '–';
        }
    } catch (e) { /* optional */ }
}

async function loadComplaints() {
    const tbody = document.getElementById('complaintsTableBody');
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4"><div class="spinner-border" style="color:#5c35cc"></div></td></tr>`;
    try {
        const res = await apiFetch('/representative/complaints?page=0&size=100', { method: 'GET' });
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
    if (activeStatusFilter !== 'ALL') list = list.filter(c => c.status === activeStatusFilter);
    if (priorityFilter !== 'ALL')     list = list.filter(c => (c.priority || 'MEDIUM') === priorityFilter);

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-5">No complaints found for selected filters.</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    list.forEach(c => {
        const priority = c.priority || 'MEDIUM';
        const statusBadge = getStatusBadge(c.status);

        const canEscalate = !['RESOLVED', 'CLOSED', 'ESCALATED'].includes(c.status);
        const canEndorse  = c.status === 'RESOLVED';

        const actions = `
            <div class="d-flex justify-content-end gap-2 flex-wrap">
                <button class="btn btn-sm btn-outline-primary" onclick="openRepAiChecklistModal('${encodeURIComponent(c.title || '')}', '${encodeURIComponent(c.categoryName || '')}')"><i class="bi bi-card-checklist me-1"></i>AI Checklist</button>
                <button class="btn btn-sm btn-outline-danger" onclick="openEscalationMemoModal(${c.complaintId})"><i class="bi bi-file-earmark-text me-1"></i>AI Memo</button>
                <button class="btn btn-sm btn-outline-warning" onclick="openPriorityModal(${c.complaintId})"><i class="bi bi-flag-fill me-1"></i>Priority</button>
                <button class="btn btn-sm btn-outline-secondary" onclick="openRemarkModal(${c.complaintId})"><i class="bi bi-chat-left-text me-1"></i>Remark</button>
                ${canEscalate ? `<button class="btn btn-sm btn-outline-danger" onclick="escalate(${c.complaintId})"><i class="bi bi-exclamation-triangle me-1"></i>Escalate</button>` : ''}
                ${canEndorse ? `<button class="btn btn-sm btn-outline-dark" onclick="endorse(${c.complaintId})"><i class="bi bi-lock-fill me-1"></i>Endorse</button>` : ''}
            </div>`;


        const aiCat = c.aiCategory || c.aiCategoryName || c.categoryName || 'Unassigned';
        const aiScore = c.aiSeverity || c.aiSeverityScore || c.severityScore || 5;
        const aiLang = c.detectedLanguage ? ` | Lang: ${c.detectedLanguage.toUpperCase()}` : '';
        const aiBadge = `<div class="mt-1"><span class="badge bg-purple"><i class="bi bi-cpu-fill me-1"></i>AI Cat: ${aiCat} (${aiScore}/10${aiLang})</span></div>`;

        tbody.innerHTML += `
            <tr>
                <td class="ps-4 fw-bold">#${c.complaintId}</td>
                <td>
                    <div class="fw-bold text-dark">${c.title}</div>
                    <small class="text-muted">${c.categoryName || 'General'} · ${c.citizenName || ''}</small>
                    ${aiBadge}
                </td>
                <td class="text-muted small">${c.location || '-'}</td>
                <td>${statusBadge}</td>
                <td><span class="badge bg-purple">${priority}</span></td>
                <td class="pe-4">${actions}</td>
            </tr>`;
    });
    if (window.i18n) window.i18n.applyToPage();
}

function getStatusBadge(status) {
    const map = {
        CREATED:    'bg-info text-dark',
        VERIFIED:   'bg-primary text-white',
        ASSIGNED:   'bg-primary text-white',
        IN_PROGRESS:'text-white',
        RESOLVED:   'bg-success text-white',
        ESCALATED:  'bg-danger text-white',
        CLOSED:     'bg-dark text-white',
    };
    const cls = map[status] || 'bg-secondary text-white';
    const style = status === 'IN_PROGRESS' ? ' style="background:#ff6f00"' : '';
    return `<span class="s-badge badge ${cls}"${style}>${status}</span>`;
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


