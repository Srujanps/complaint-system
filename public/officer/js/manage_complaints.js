let assignModal;
let workOrderModal;
let verificationModal;
let currentEligibilityData = null;
let currentComplaintsList = [];
let currentFilter = 'ALL';

document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('token') || localStorage.getItem('role') !== 'OFFICER') {
        window.location.href = '../login.html';
        return;
    }
    loadNavbar('navbar-placeholder', { rootPath: '../', activeLink: 'officer' });

    assignModal = new bootstrap.Modal(document.getElementById('assignModal'));
    workOrderModal = new bootstrap.Modal(document.getElementById('workOrderModal'));
    verificationModal = new bootstrap.Modal(document.getElementById('verificationModal'));

    loadComplaints();

    const assignForm = document.getElementById('assignForm');
    assignForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitAssignment();
    });
});

async function filterComplaints(mode) {
    currentFilter = mode;
    document.getElementById('btnFilterAll').classList.toggle('active', mode === 'ALL');
    document.getElementById('btnFilterDup').classList.toggle('active', mode === 'DUPLICATES');
    loadComplaints();
}

async function loadComplaints() {
    const tbody = document.getElementById('complaintsTableBody');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4"><div class="spinner-border text-danger" role="status"></div></td></tr>';

    try {
        const endpoint = (currentFilter === 'DUPLICATES') ? '/officer/complaints/duplicates?page=0&size=100' : '/officer/complaints?page=0&size=100';
        const res = await apiFetch(endpoint, { method: 'GET' });
        if (res && res.ok) {
            const data = await res.json();
            currentComplaintsList = data.content || [];

            const badge = document.getElementById('complaintCountBadge');
            badge.textContent = `${currentComplaintsList.length} Grievances`;

            if (currentComplaintsList.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No complaints found.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            currentComplaintsList.forEach(c => {
                let badgeClass = 'bg-secondary';
                if (c.status === 'FLAGGED_DUPLICATE' || c.status === 'DUPLICATE') badgeClass = 'bg-danger text-white';
                else if (c.status === 'CREATED' || c.status === 'RECEIVED') badgeClass = 'bg-info text-dark';
                else if (c.status === 'ASSIGNED') badgeClass = 'bg-primary';
                else if (c.status === 'VENDOR_ACCEPTED') badgeClass = 'bg-warning text-dark';
                else if (c.status === 'IN_PROGRESS') badgeClass = 'bg-orange text-white';
                else if (c.status === 'COMPLETED' || c.status === 'OFFICER_VERIFICATION') badgeClass = 'bg-purple text-white';
                else if (c.status === 'RESOLVED' || c.status === 'VERIFIED') badgeClass = 'bg-success';
                else if (c.status === 'CLOSED') badgeClass = 'bg-dark';

                const inlineStyle = c.status === 'IN_PROGRESS' ? 'style="background:#ff6f00"' : (c.status === 'COMPLETED' ? 'style="background:#6f42c1"' : '');

                let geoStr = (c.latitude && c.longitude)
                    ? `<br><small class="text-muted"><i class="bi bi-geo-alt"></i> ${parseFloat(c.latitude).toFixed(4)}, ${parseFloat(c.longitude).toFixed(4)}</small>`
                    : '';

                const evidenceStr = c.evidenceImageData
                    ? `<div class="mt-2">
                            <span class="small fw-semibold text-muted d-block"><i class="bi bi-image text-primary me-1"></i>Citizen Photo</span>
                            <img src="${c.evidenceImageData}" alt="Evidence photo" class="rounded border mt-1" style="width:100px;height:75px;object-fit:cover">
                       </div>`
                    : '';

                const resolutionStr = c.resolutionEvidenceImageData
                    ? `<div class="mt-2 p-1 bg-success-subtle rounded border border-success">
                            <span class="small fw-bold text-success d-block"><i class="bi bi-check-circle-fill me-1"></i>After-Repair Proof</span>
                            <img src="${c.resolutionEvidenceImageData}" alt="Completed repair photo" class="rounded border mt-1" style="width:100px;height:75px;object-fit:cover">
                            ${c.aiResolutionScore ? `<div class="mt-1"><span class="badge bg-dark">AI QA: ${c.aiResolutionScore}%</span></div>` : ''}
                       </div>`
                    : '';

                // Department
                const dept = c.department || resolveDepartment(c.categoryName || c.aiCategory || '');
                let deptBadgeClass = 'bg-secondary';
                if (dept.includes('Road')) deptBadgeClass = 'bg-dark';
                else if (dept.includes('Water')) deptBadgeClass = 'bg-info text-dark';
                else if (dept.includes('Electric')) deptBadgeClass = 'bg-warning text-dark';
                else if (dept.includes('Sanitation')) deptBadgeClass = 'bg-success';

                // Assigned contractor & work order
                let contractorStr = '<span class="text-muted small">Pending Assignment</span>';
                if (c.assignedVendorName || c.assignedVendorUsername) {
                    const wo = c.workOrderNumber ? `<span class="badge bg-light text-danger border fw-bold font-monospace d-block mt-1">${c.workOrderNumber}</span>` : '';
                    contractorStr = `
                        <div class="fw-bold text-dark small">${c.assignedVendorName || c.assignedVendorUsername}</div>
                        <small class="text-muted"><i class="bi bi-person me-1"></i>@${c.assignedVendorUsername}</small>
                        ${wo}
                    `;
                }

                // SLA Countdown calculation
                let slaBadge = '';
                if (c.slaDeadline) {
                    const now = new Date();
                    const deadline = new Date(c.slaDeadline);
                    const diffMs = deadline - now;
                    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

                    if (['RESOLVED', 'VERIFIED', 'CLOSED'].includes(c.status)) {
                        slaBadge = `<span class="badge bg-success-subtle text-success border border-success mt-1"><i class="bi bi-check-all me-1"></i>Resolved</span>`;
                    } else if (diffHours < 0) {
                        slaBadge = `<span class="badge bg-danger mt-1 animate-pulse"><i class="bi bi-exclamation-octagon-fill me-1"></i>OVERDUE by ${Math.abs(diffHours)}h</span>`;
                    } else if (diffHours <= 4) {
                        slaBadge = `<span class="badge bg-warning text-dark mt-1"><i class="bi bi-clock-history me-1"></i>${diffHours}h Left (Urgent)</span>`;
                    } else {
                        slaBadge = `<span class="badge bg-light text-dark border mt-1"><i class="bi bi-stopwatch me-1"></i>${diffHours}h Remaining</span>`;
                    }
                }

                // ── State-Driven Action Buttons ──
                let aiBtn = `<button class="btn btn-sm btn-outline-primary me-1 mb-1" onclick="openOfficerAiModal(${c.complaintId})" title="AI Action Plan"><i class="bi bi-robot"></i> AI Plan</button>`;
                let confirmAiBtn = `<button class="btn btn-sm btn-outline-info me-1 mb-1" onclick="openConfirmAiModal(${c.complaintId}, '${encodeURIComponent(c.aiCategory || c.aiCategoryName || '')}')" title="Confirm/Override AI Category"><i class="bi bi-check2-circle"></i> AI Cat</button>`;
                let dupBtn = (c.isDuplicate || c.status === 'FLAGGED_DUPLICATE')
                    ? `<button class="btn btn-sm btn-outline-success me-1 mb-1" onclick="unflagComplaintDuplicate(${c.complaintId})" title="Restore from Duplicate"><i class="bi bi-arrow-counterclockwise"></i> Unflag</button>`
                    : `<button class="btn btn-sm btn-outline-danger me-1 mb-1" onclick="markComplaintAsDuplicate(${c.complaintId})" title="Move to Duplicate Flagged Section"><i class="bi bi-files"></i> Duplicate</button>`;

                let actionBtn = '';
                if (['CREATED', 'RECEIVED', 'OFFICER_REVIEW'].includes(c.status)) {
                    actionBtn = `${aiBtn}${confirmAiBtn}${dupBtn}<button class="btn btn-sm btn-danger mb-1" onclick="openAssignModal(${c.complaintId})"><i class="bi bi-person-gear"></i> Assign</button>`;
                } else if (c.status === 'ASSIGNED') {
                    // Prevent duplicate assign button! Show View Assignment / Work Order
                    actionBtn = `${aiBtn}${dupBtn}<button class="btn btn-sm btn-outline-dark mb-1" onclick="viewWorkOrder(${c.complaintId})"><i class="bi bi-file-earmark-text"></i> View Assignment</button>`;
                } else if (c.status === 'VENDOR_ACCEPTED') {
                    actionBtn = `${aiBtn}${dupBtn}<button class="btn btn-sm btn-outline-primary mb-1" onclick="viewWorkOrder(${c.complaintId})"><i class="bi bi-geo me-1"></i> Track Vendor</button>`;
                } else if (c.status === 'IN_PROGRESS') {
                    actionBtn = `${aiBtn}<button class="btn btn-sm btn-warning mb-1" onclick="viewWorkOrder(${c.complaintId})"><i class="bi bi-activity me-1"></i> Track Progress</button>`;
                } else if (c.status === 'COMPLETED' || c.status === 'OFFICER_VERIFICATION' || (c.status === 'RESOLVED' && c.completionEvidenceImageData && !c.aiResolutionNote)) {
                    // Vendor submitted work: Officer must verify!
                    actionBtn = `<button class="btn btn-sm btn-success mb-1 fw-bold" onclick="openVerificationModal(${c.complaintId})"><i class="bi bi-patch-check-fill me-1"></i> Verify Completion</button>`;
                } else if (['RESOLVED', 'VERIFIED'].includes(c.status)) {
                    actionBtn = `<button class="btn btn-sm btn-outline-secondary me-1 mb-1" onclick="viewWorkOrder(${c.complaintId})"><i class="bi bi-eye"></i> Details</button>
                                 <button class="btn btn-sm btn-dark mb-1" onclick="closeComplaint(${c.complaintId})"><i class="bi bi-lock-fill"></i> Close</button>`;
                } else if (c.status === 'CLOSED') {
                    actionBtn = `<button class="btn btn-sm btn-outline-secondary mb-1" onclick="viewWorkOrder(${c.complaintId})"><i class="bi bi-eye"></i> View Details</button>`;
                } else if (c.status === 'FLAGGED_DUPLICATE' || c.isDuplicate) {
                    actionBtn = `${dupBtn}<button class="btn btn-sm btn-outline-secondary mb-1" onclick="viewWorkOrder(${c.complaintId})"><i class="bi bi-eye"></i> View</button>`;
                } else {
                    actionBtn = `${aiBtn}${confirmAiBtn}${dupBtn}<button class="btn btn-sm btn-danger mb-1" onclick="openAssignModal(${c.complaintId})"><i class="bi bi-person-gear"></i> Assign</button>`;
                }

                // AI Badges
                const score = c.aiSeverity || c.aiSeverityScore || c.severityScore || 5;
                const priority = c.priority || c.aiPriority || (score >= 8 ? 'CRITICAL' : score >= 6 ? 'HIGH' : 'MEDIUM');
                let pBg = 'bg-primary';
                if (priority === 'CRITICAL') pBg = 'bg-danger';
                else if (priority === 'HIGH') pBg = 'bg-warning text-dark';
                else if (priority === 'LOW') pBg = 'bg-info text-dark';

                const aiCat = c.aiCategory || c.aiCategoryName || 'Unassigned';
                const confirmedTag = c.aiConfirmed ? '<span class="badge bg-success ms-1">Confirmed ✓</span>' : '<span class="badge bg-secondary ms-1">AI Suggested ⚡</span>';

                let dupNotice = '';
                if (c.status === 'FLAGGED_DUPLICATE' || c.isDuplicate) {
                    const dupRef = c.duplicateOfId || c.duplicateOfComplaintId || 'N/A';
                    dupNotice = `<div class="mt-1"><span class="badge bg-danger"><i class="bi bi-files me-1"></i> FLAGGED DUPLICATE ${dupRef !== 'N/A' ? `(Matches #${dupRef})` : ''}</span></div>`;
                }

                tbody.innerHTML += `
                    <tr>
                        <td class="ps-3 fw-bold text-danger">#${c.complaintId}</td>
                        <td>
                            <div class="fw-bold text-dark">${c.title}</div>
                            <small class="text-muted d-block text-truncate" style="max-width: 320px;">${c.description}</small>
                            <div class="small text-muted mt-1">
                                <i class="bi bi-person-fill text-primary me-1"></i>Citizen: <strong>${c.citizenName || (c.citizen ? c.citizen.fullName || c.citizen.username : 'Citizen')}</strong>
                                ${(c.citizen && c.citizen.phone) || c.citizenPhone ? ` &bull; <i class="bi bi-telephone text-secondary me-1"></i>${(c.citizen && c.citizen.phone) || c.citizenPhone}` : ''}
                            </div>
                            ${dupNotice}
                            <div class="mt-1">
                                <span class="badge ${pBg} me-1"><i class="bi bi-cpu-fill me-1"></i>AI ${priority} (${score}/10)</span>
                                ${confirmedTag}
                            </div>
                        </td>
                        <td>
                            <span class="badge ${deptBadgeClass} mb-1">${dept}</span>
                            <div class="small text-muted"><i class="bi bi-tag me-1"></i>${c.categoryName || aiCat}</div>
                        </td>
                        <td>
                            <div class="small fw-semibold text-dark">${c.location || '-'}</div>
                            ${geoStr}
                            ${evidenceStr}
                            ${resolutionStr}
                        </td>
                        <td>${contractorStr}</td>
                        <td>
                            <span class="badge ${badgeClass}" ${inlineStyle}>${c.status}</span>
                            <div>${slaBadge}</div>
                        </td>
                        <td class="text-end pe-3">${actionBtn}</td>
                    </tr>
                `;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-danger">Failed to load complaints.</td></tr>';
        }
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-danger">Error loading complaints.</td></tr>';
    }
}

function resolveDepartment(cat) {
    if (!cat) return 'Road Maintenance';
    const l = cat.toLowerCase();
    if (l.includes('road') || l.includes('pothole') || l.includes('asphalt') || l.includes('traffic')) return 'Road Maintenance';
    if (l.includes('water') || l.includes('drain') || l.includes('pipe') || l.includes('sewage') || l.includes('leak')) return 'Water Supply';
    if (l.includes('electr') || l.includes('light') || l.includes('power') || l.includes('wire')) return 'Electrical Maintenance';
    if (l.includes('garb') || l.includes('waste') || l.includes('sanitat') || l.includes('clean')) return 'Sanitation and Waste Management';
    return 'Road Maintenance';
}

// ── Open Dynamic Department Assignment Modal ─────────────────────────────────
async function openAssignModal(complaintId) {
    document.getElementById('complaintIdToAssign').value = complaintId;
    document.getElementById('assignForm').reset();
    document.getElementById('complaintIdToAssign').value = complaintId;
    document.getElementById('ineligibleAlertContainer').style.display = 'none';
    document.getElementById('overrideReasonDiv').style.display = 'none';
    document.getElementById('overrideIneligibleCheckbox').checked = false;

    const cardsRow = document.getElementById('aiMatchCardsRow');
    cardsRow.innerHTML = '<div class="col-12 text-center py-3 text-muted"><div class="spinner-border spinner-border-sm text-primary me-2"></div>Evaluating 10-Factor AI Matchmaker...</div>';

    assignModal.show();

    try {
        const res = await apiFetch(`/officer/complaints/${complaintId}/vendor-eligibility`, { method: 'GET' });
        if (res && res.ok) {
            currentEligibilityData = await res.json();
            populateAssignModal(currentEligibilityData);
        } else {
            ui.error("Failed to load contractor eligibility data.");
        }
    } catch (e) {
        ui.error("Error connecting to vendor matching service.");
    }
}

function populateAssignModal(data) {
    const c = data.complaint || {};
    const dept = data.detectedDepartment || 'Road Maintenance';

    document.getElementById('assignTicketRef').textContent = c.complaintRef || `#${c.complaintId}`;
    document.getElementById('assignTicketTitle').textContent = c.title || '-';
    document.getElementById('assignTicketDesc').textContent = c.title ? c.title : '-';
    document.getElementById('assignTicketLoc').textContent = c.location || 'Ward Area';
    document.getElementById('assignTicketCat').textContent = c.category || dept;
    document.getElementById('assignTicketPriority').textContent = c.priority || 'HIGH';
    document.getElementById('assignDeptBadge').textContent = dept;
    document.getElementById('assignedDepartmentInput').value = dept;
    document.getElementById('deptFormTitle').textContent = dept;

    // Render 10-Factor AI Matchmaker Top 3 Cards
    renderAiMatchCards(data.topRecommendations || []);

    // Populate Vendor Dropdown with Eligible vs Ineligible Optgroups
    const optEligible = document.getElementById('optgroupEligible');
    const optIneligible = document.getElementById('optgroupIneligible');
    optEligible.innerHTML = '';
    optIneligible.innerHTML = '';

    const eligibleList = data.eligibleVendors || [];
    const ineligibleList = data.ineligibleVendors || [];

    if (eligibleList.length === 0) {
        optEligible.innerHTML = '<option value="" disabled>No contractors currently meet active contract criteria</option>';
    } else {
        eligibleList.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v.vendorId;
            const dist = v.distanceKm ? ` (~${v.distanceKm} km)` : '';
            opt.textContent = `★ ${v.name} (@${v.username}) — [${v.contractNumber || 'Active Contract'}] | ${v.activeTasks} Active Jobs${dist}`;
            optEligible.appendChild(opt);
        });
    }

    if (ineligibleList.length > 0) {
        ineligibleList.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v.vendorId;
            opt.textContent = `⚠️ ${v.name} (@${v.username}) — Ineligible: ${v.ineligibilityReason || 'Restricted'}`;
            opt.dataset.ineligible = "true";
            opt.dataset.reason = v.ineligibilityReason || "Does not meet active department contract requirements";
            optIneligible.appendChild(opt);
        });
    }

    // Auto-select recommended vendor
    if (data.recommendedVendorId) {
        document.getElementById('vendorSelect').value = String(data.recommendedVendorId);
    } else if (eligibleList.length > 0) {
        document.getElementById('vendorSelect').value = String(eligibleList[0].vendorId);
    }

    // Render Department Technical Specifications Form
    renderDepartmentSpecificFields(dept);

    // Initial SLA & Deadline Calculation
    onVendorSelected();
}

function renderAiMatchCards(recommendations) {
    const row = document.getElementById('aiMatchCardsRow');
    if (!recommendations || recommendations.length === 0) {
        row.innerHTML = '<div class="col-12 text-muted small p-2">No registered contractor recommendations available.</div>';
        return;
    }

    row.innerHTML = '';
    recommendations.forEach((r, idx) => {
        const isTop = idx === 0;
        const borderClass = isTop ? 'border-primary bg-primary-subtle' : 'border-light-subtle bg-white';
        const badgeColor = r.matchPercentage >= 80 ? 'bg-success' : 'bg-primary';

        row.innerHTML += `
            <div class="col-md-4">
                <div class="card h-100 p-3 shadow-sm matchmaker-card ${borderClass} ${isTop ? 'selected' : ''}" onclick="selectRecommendedVendor(${r.vendorId}, this)">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="badge bg-dark">${idx + 1}. Recommendation</span>
                        <span class="badge ${badgeColor} fs-6">${r.matchPercentage}% Match</span>
                    </div>
                    <h6 class="fw-bold mb-0 text-dark">${r.name}</h6>
                    <small class="text-muted mb-2"><i class="bi bi-person me-1"></i>@${r.username} | ${r.designation || 'Contractor'}</small>
                    
                    <div class="small mb-1 text-dark">
                        <i class="bi bi-shield-check text-success me-1"></i><strong>${r.contractNumber || 'Contract Active'}</strong>
                    </div>
                    <div class="d-flex justify-content-between small text-muted mb-2">
                        <span><i class="bi bi-briefcase me-1"></i>${r.activeTasks} Active / 5</span>
                        <span><i class="bi bi-geo-alt me-1"></i>${r.distanceDisplay || 'Ward Area'}</span>
                    </div>
                    <div class="small p-1 bg-white rounded border text-muted" style="font-size:0.75rem">
                        ${r.reason}
                    </div>
                </div>
            </div>
        `;
    });
}

function selectRecommendedVendor(vendorId, cardEl) {
    document.querySelectorAll('.matchmaker-card').forEach(c => c.classList.remove('selected'));
    if (cardEl) cardEl.classList.add('selected');
    const select = document.getElementById('vendorSelect');
    select.value = String(vendorId);
    onVendorSelected();
}

function onVendorSelected() {
    const select = document.getElementById('vendorSelect');
    const selectedOption = select.options[select.selectedIndex];
    const alertBox = document.getElementById('ineligibleAlertContainer');
    const reasonText = document.getElementById('ineligibleReasonText');

    if (selectedOption && selectedOption.dataset.ineligible === "true") {
        alertBox.style.display = 'block';
        reasonText.textContent = selectedOption.dataset.reason || "This contractor does not hold an active contract for this department.";
    } else {
        alertBox.style.display = 'none';
        document.getElementById('overrideIneligibleCheckbox').checked = false;
        document.getElementById('overrideReasonDiv').style.display = 'none';
    }

    // Update contractual SLA from vendor contract
    let slaHours = 24;
    const vendorId = parseInt(select.value);
    if (currentEligibilityData) {
        const all = currentEligibilityData.allVendors || [];
        const v = all.find(x => x.vendorId === vendorId);
        if (v && v.contractSlaHours) {
            slaHours = v.contractSlaHours;
        }
    }
    document.getElementById('contractSlaDisplay').textContent = `${slaHours} Hours`;
    document.getElementById('estimatedHoursInput').value = slaHours;
    updateSlaDeadlineCalculation();
}

function toggleOverrideJustification() {
    const checked = document.getElementById('overrideIneligibleCheckbox').checked;
    document.getElementById('overrideReasonDiv').style.display = checked ? 'block' : 'none';
}

function updateSlaDeadlineCalculation() {
    const hours = parseInt(document.getElementById('estimatedHoursInput').value) || 24;
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + hours);

    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    document.getElementById('slaDeadlineDisplay').innerHTML = `
        <i class="bi bi-calendar-event me-1"></i>${deadline.toLocaleDateString('en-US', options)} 
        <span class="badge bg-danger ms-2">${hours} Hours Target</span>
    `;
}

// ── Dynamic Department Fields (Road, Water, Electrical, Sanitation) ──────────
function renderDepartmentSpecificFields(dept) {
    const container = document.getElementById('dynamicDeptFieldsContainer');

    if (dept === 'Road Maintenance') {
        container.innerHTML = `
            <div class="row g-3">
                <div class="col-md-4">
                    <label class="form-label small fw-bold">Road Damage Severity <span class="text-danger">*</span></label>
                    <select class="form-select form-select-sm" id="deptReq_severity" required>
                        <option value="Severe Deep Crater">Severe Deep Crater (> 15cm)</option>
                        <option value="Moderate Asphalt Raveling">Moderate Asphalt Raveling</option>
                        <option value="Minor Surface Pothole">Minor Surface Pothole</option>
                        <option value="Complete Structural Roadbed Failure">Structural Roadbed Failure</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-bold">Road Classification <span class="text-danger">*</span></label>
                    <select class="form-select form-select-sm" id="deptReq_roadType" required>
                        <option value="Arterial City Highway">Arterial City Highway</option>
                        <option value="Commercial High-Traffic Road">Commercial High-Traffic Road</option>
                        <option value="Residential Ward Street">Residential Ward Street</option>
                        <option value="Narrow Alley / By-lane">Narrow Alley / By-lane</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-bold">Required Repair Method <span class="text-danger">*</span></label>
                    <select class="form-select form-select-sm" id="deptReq_repairMethod" required>
                        <option value="Hot Mix Bituminous Asphalt Patch">Hot Mix Bituminous Asphalt Patch</option>
                        <option value="Cold Emulsion Immediate Seal">Cold Emulsion Immediate Seal</option>
                        <option value="M30 Concrete Reinstatement">M30 Concrete Reinstatement</option>
                        <option value="Interlocking Paver Block Relay">Interlocking Paver Block Relay</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-bold">Required Heavy Equipment & Tools</label>
                    <input type="text" class="form-control form-control-sm" id="deptReq_equipment" value="Vibratory Asphalt Roller, Tar Kettle, Jackhammer, Tipper Dumper">
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-bold">Traffic Safety & Diversion Protocols</label>
                    <input type="text" class="form-control form-control-sm" id="deptReq_safety" value="Reflective Cones, Barricades, Night Work Lighting, Traffic Marshal Assistance">
                </div>
            </div>
        `;
    } else if (dept === 'Water Supply') {
        container.innerHTML = `
            <div class="row g-3">
                <div class="col-md-4">
                    <label class="form-label small fw-bold">Pipeline Leakage Severity <span class="text-danger">*</span></label>
                    <select class="form-select form-select-sm" id="deptReq_severity" required>
                        <option value="High Pressure Distribution Main Burst">High Pressure Main Burst</option>
                        <option value="Moderate Joint Gush">Moderate Joint Gush</option>
                        <option value="Continuous Underground Seepage">Underground Seepage</option>
                        <option value="Contaminated Supply Ingress">Contaminated Supply Ingress</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-bold">Pipeline Specification <span class="text-danger">*</span></label>
                    <select class="form-select form-select-sm" id="deptReq_pipelineType" required>
                        <option value="Ductile Iron (DI) 300mm Main">Ductile Iron (DI) 300mm Main</option>
                        <option value="Cast Iron (CI) Sub-Main">Cast Iron (CI) Sub-Main</option>
                        <option value="HDPE Distribution Line">HDPE Distribution Line</option>
                        <option value="GI Household Feeder Branch">GI Household Feeder Branch</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-bold">Public Water Supply Disruption <span class="text-danger">*</span></label>
                    <select class="form-select form-select-sm" id="deptReq_disruption" required>
                        <option value="Complete Ward Zone Shutdown">Complete Ward Zone Shutdown</option>
                        <option value="Low Pressure Water Supply">Low Pressure Water Supply</option>
                        <option value="Localized Single Street Disruption">Localized Street Disruption</option>
                        <option value="Zero Household Supply Disruption">No Supply Disruption</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-bold">Required Engineering Repair Method</label>
                    <input type="text" class="form-control form-control-sm" id="deptReq_repairMethod" value="Full Circumference Pipe Collar Clamp Replacement, Valve Sluice Tightening">
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-bold">Emergency Drinking Water Tanker Backup</label>
                    <select class="form-select form-select-sm" id="deptReq_tankerBackup">
                        <option value="Dispatched 2 Tankers to Affected Residents">Yes - Deploy Emergency Potable Tankers</option>
                        <option value="Not Required">Not Required</option>
                    </select>
                </div>
            </div>
        `;
    } else if (dept === 'Electrical Maintenance') {
        container.innerHTML = `
            <div class="row g-3">
                <div class="col-md-4">
                    <label class="form-label small fw-bold">Electrical Fault Type <span class="text-danger">*</span></label>
                    <select class="form-select form-select-sm" id="deptReq_faultType" required>
                        <option value="Substation Feeder Blackout">Substation Feeder Blackout</option>
                        <option value="Underground Cable Insulation Puncture">Underground Cable Short Circuit</option>
                        <option value="Live Overhead Hanging Wire">Live Overhead Hanging Wire</option>
                        <option value="Streetlight Luminaire & Timer Fault">Streetlight Luminaire Circuit Out</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-bold">Electrical Public Safety Risk <span class="text-danger">*</span></label>
                    <select class="form-select form-select-sm" id="deptReq_safetyRisk" required>
                        <option value="CRITICAL: Live Electrocution Hazard">CRITICAL: Shock / Electrocution Hazard</option>
                        <option value="MODERATE: Sparking Junction Box">MODERATE: Sparking Junction Box</option>
                        <option value="LOW: Unpowered Darkened Poles">LOW: Darkened Poles (Traffic Risk)</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-bold">Required Grid Safety Isolation</label>
                    <select class="form-select form-select-sm" id="deptReq_gridIsolation">
                        <option value="Grid Isolation Permit Issued (Lockout/Tagout Required)">Feeder Lockout/Tagout Mandatory</option>
                        <option value="Low Voltage Local Breaker Tripped">Low Voltage Breaker Only</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-bold">Required Heavy Equipment</label>
                    <input type="text" class="form-control form-control-sm" id="deptReq_equipment" value="Hydraulic Sky-Lift Boom Bucket Truck, Digital Megger Insulation Tester">
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-bold">Dielectric Safety PPE Requirements</label>
                    <input type="text" class="form-control form-control-sm" id="deptReq_safety" value="11kV Class 3 Dielectric Rubber Gloves, Arc Flash Visor, Insulated Ladders">
                </div>
            </div>
        `;
    } else if (dept === 'Sanitation and Waste Management') {
        container.innerHTML = `
            <div class="row g-3">
                <div class="col-md-4">
                    <label class="form-label small fw-bold">Solid Waste Type <span class="text-danger">*</span></label>
                    <select class="form-select form-select-sm" id="deptReq_wasteType" required>
                        <option value="Decomposing Organic Municipal Solid Waste">Decomposing MSW / Household Garbage</option>
                        <option value="Illegal Bulk Construction & Demolition Debris">Construction & Demolition Debris</option>
                        <option value="Hazardous Bio-Medical / Chemical Waste">Bio-Hazard / Medical Waste</option>
                        <option value="Green Horticultural & Fallen Tree Waste">Horticultural / Vegetative Waste</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-bold">Estimated Waste Quantity <span class="text-danger">*</span></label>
                    <select class="form-select form-select-sm" id="deptReq_quantity" required>
                        <option value="3 to 5 Metric Tons (Bulk Dump)">3 - 5 Metric Tons (Bulk Dump)</option>
                        <option value="1 to 3 Metric Tons (Medium Pile)">1 - 3 Metric Tons</option>
                        <option value="Under 1 Metric Ton (Localized Spill)">Under 1 Metric Ton</option>
                        <option value="Over 10 Metric Tons (Major Dump Site)">Over 10 Metric Tons (Multi-Truck)</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-bold">Collection Vehicle Type <span class="text-danger">*</span></label>
                    <select class="form-select form-select-sm" id="deptReq_vehicle" required>
                        <option value="Hydraulic Compactor Refuse Truck (14m3)">Hydraulic Compactor Truck</option>
                        <option value="Tipper Dumper Truck">Tipper Dumper Truck</option>
                        <option value="Auto-Tipper (Narrow Lane Specialized)">Auto-Tipper (Narrow Lane)</option>
                        <option value="Open Tractor Trailer with Crane Lift">Open Tractor with Crane</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-bold">Sanitation & Disinfection Protocol</label>
                    <input type="text" class="form-control form-control-sm" id="deptReq_cleanup" value="Complete Mechanical Lifting, Surface Lime Bleaching, High-Pressure Wash">
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-bold">Disposal Verification Proof</label>
                    <input type="text" class="form-control form-control-sm" id="deptReq_disposalProof" value="Authorized Municipal Landfill Weighbridge Slip + GPS Landfill Geotag Mandatory">
                </div>
            </div>
        `;
    }
}

// ── Submit Assignment with Work Order Generation ─────────────────────────────
async function submitAssignment() {
    const complaintId = parseInt(document.getElementById('complaintIdToAssign').value);
    const vendorId = parseInt(document.getElementById('vendorSelect').value);
    const department = document.getElementById('assignedDepartmentInput').value;
    const estimatedHours = parseInt(document.getElementById('estimatedHoursInput').value) || 24;
    const workInstructions = document.getElementById('workInstructionsInput').value.trim();

    if (!vendorId) {
        ui.error("Please choose a municipal contractor.");
        return;
    }

    // Check override if ineligible
    const isOverride = document.getElementById('overrideIneligibleCheckbox').checked;
    const overrideReason = document.getElementById('overrideReasonInput').value.trim();

    const select = document.getElementById('vendorSelect');
    const selectedOption = select.options[select.selectedIndex];
    if (selectedOption && selectedOption.dataset.ineligible === "true" && !isOverride) {
        ui.error("This contractor is ineligible. Please check 'Authorize Official Override' and provide a reason to proceed.");
        return;
    }
    if (isOverride && !overrideReason) {
        ui.error("Please provide an official audit override reason.");
        return;
    }

    // Collect department technical specs JSON
    const deptSpecs = {};
    const inputs = document.querySelectorAll('#dynamicDeptFieldsContainer [id^="deptReq_"]');
    inputs.forEach(inp => {
        const key = inp.id.replace('deptReq_', '');
        deptSpecs[key] = inp.value;
    });

    const body = {
        complaintId,
        vendorId,
        department,
        estimatedHours,
        workInstructions,
        departmentRequirements: JSON.stringify(deptSpecs),
        overrideIneligible: isOverride,
        overrideReason: isOverride ? overrideReason : null
    };

    ui.showLoader("Generating Work Order & Dispatching Contractor...");
    try {
        const res = await apiFetch('/officer/complaints/assign', {
            method: 'POST',
            body: JSON.stringify(body)
        });

        if (res && res.ok) {
            const assignment = await res.json();
            ui.success(`Work Order ${assignment.workOrderNumber} issued successfully!`);
            assignModal.hide();
            loadComplaints();
        } else {
            const err = res ? await res.text() : 'Assignment failed';
            ui.error(err || "Failed to assign complaint.");
        }
    } catch (e) {
        ui.error("An error occurred during assignment.");
    } finally {
        ui.hideLoader();
    }
}

// ── Printable Municipal Work Order Viewer ────────────────────────────────────
async function viewWorkOrder(complaintId) {
    ui.showLoader("Retrieving Work Order...");
    try {
        const res = await apiFetch(`/officer/complaints/${complaintId}/assignment`, { method: 'GET' });
        if (res && res.ok) {
            const a = await res.json();
            renderWorkOrderDocument(a);
            workOrderModal.show();
        } else {
            ui.error("No active work order found for this complaint.");
        }
    } catch (e) {
        ui.error("Error loading work order.");
    } finally {
        ui.hideLoader();
    }
}

function renderWorkOrderDocument(a) {
    const el = document.getElementById('printableWorkOrder');
    let deptSpecsHtml = '<p class="text-muted small">Standard municipal execution specifications.</p>';

    if (a.departmentRequirements) {
        try {
            const parsed = JSON.parse(a.departmentRequirements);
            deptSpecsHtml = '<div class="table-responsive"><table class="table table-sm table-bordered">';
            for (const [k, v] of Object.entries(parsed)) {
                const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                deptSpecsHtml += `<tr><th class="bg-light w-40 small">${label}</th><td class="small fw-semibold">${v}</td></tr>`;
            }
            deptSpecsHtml += '</table></div>';
        } catch (ignored) {}
    }

    const assignedDate = a.assignedAt ? new Date(a.assignedAt).toLocaleString() : 'N/A';
    const slaDeadline = a.slaDeadline ? new Date(a.slaDeadline).toLocaleString() : 'N/A';

    el.innerHTML = `
        <div class="border p-4 bg-white rounded shadow-sm">
            <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                <div>
                    <h5 class="fw-bold mb-0 text-danger"><i class="bi bi-building me-2"></i>MUNICIPAL CORPORATION CIVIC WORKS</h5>
                    <div class="text-muted small">Official Departmental Work Order & Contractor Dispatch Order</div>
                </div>
                <div class="text-end">
                    <h5 class="fw-bold text-dark font-monospace mb-0">${a.workOrderNumber || 'WO-PENDING'}</h5>
                    <span class="badge bg-danger">${a.department || 'Civil Works'}</span>
                </div>
            </div>

            <div class="row g-3 mb-3">
                <div class="col-6">
                    <small class="text-muted fw-bold d-block">TICKET REFERENCE</small>
                    <span class="fw-bold text-dark">${a.complaintRef || ('#' + a.complaintId)}</span>
                </div>
                <div class="col-6 text-end">
                    <small class="text-muted fw-bold d-block">ISSUE DATE & TIME</small>
                    <span class="text-dark">${assignedDate}</span>
                </div>
                <div class="col-6">
                    <small class="text-muted fw-bold d-block">AWARDED CONTRACTOR</small>
                    <span class="fw-bold text-primary">${a.vendorName} (@${a.vendorUsername})</span>
                    <div class="small text-muted"><i class="bi bi-telephone me-1"></i>${a.vendorPhone || '-'}</div>
                </div>
                <div class="col-6 text-end">
                    <small class="text-muted fw-bold d-block">ACTIVE MASTER CONTRACT</small>
                    <span class="badge bg-light text-dark border font-monospace">${a.contractNumber || 'Standard Master Agreement'}</span>
                </div>
            </div>

            <div class="p-3 bg-light rounded border mb-3">
                <h6 class="fw-bold text-dark mb-1">${a.complaintTitle}</h6>
                <div class="small text-muted mb-2">${a.complaintDescription}</div>
                <div class="d-flex gap-3 small">
                    <span><i class="bi bi-geo-alt text-danger me-1"></i><strong>Location:</strong> ${a.location || '-'}</span>
                    <span><i class="bi bi-exclamation-triangle text-warning me-1"></i><strong>Priority:</strong> ${a.priority || 'MEDIUM'}</span>
                </div>
            </div>

            <h6 class="fw-bold text-primary mb-2"><i class="bi bi-sliders me-1"></i> Department Technical Specifications</h6>
            ${deptSpecsHtml}

            <div class="row g-3 mb-3 border-top pt-2">
                <div class="col-6">
                    <small class="text-muted fw-bold d-block">ESTIMATED RESOLUTION TIME</small>
                    <span class="fw-bold text-dark">${a.estimatedHours || 24} Hours</span>
                </div>
                <div class="col-6 text-end">
                    <small class="text-muted fw-bold d-block">MANDATORY SLA DEADLINE</small>
                    <span class="fw-bold text-danger">${slaDeadline}</span>
                </div>
            </div>

            <div class="p-2 bg-light rounded border mb-3 small">
                <strong>Official Work Instructions:</strong> ${a.workInstructions || a.notes || 'Carry out repair in accordance with municipal standards and upload on-site arrival and after-repair completion proofs.'}
            </div>

            <div class="d-flex justify-content-between align-items-center border-top pt-3 text-muted small">
                <span>Issued by Officer: <strong>@${a.assignedByName || 'Ward Officer'}</strong></span>
                <span>Current Status: <strong class="badge bg-primary">${a.status}</strong></span>
            </div>
        </div>
    `;
}

// ── Department Completion Verification Modal ─────────────────────────────────
async function openVerificationModal(complaintId) {
    ui.showLoader("Loading completion verification audit...");
    try {
        const res = await apiFetch(`/officer/complaints/${complaintId}/assignment`, { method: 'GET' });
        if (res && res.ok) {
            const a = await res.json();
            populateVerificationModal(a);
            verificationModal.show();
        } else {
            ui.error("Could not load assignment details for verification.");
        }
    } catch (e) {
        ui.error("Error loading verification details.");
    } finally {
        ui.hideLoader();
    }
}

function populateVerificationModal(a) {
    document.getElementById('verificationAssignmentId').value = a.assignmentId;
    document.getElementById('verifyWorkOrderNum').textContent = a.workOrderNumber || ('WO-ID-' + a.assignmentId);
    document.getElementById('verifyDeptBadge').textContent = a.department || 'Road Maintenance';
    document.getElementById('verifyComplaintTitle').textContent = a.complaintTitle;
    document.getElementById('verifyComplaintLoc').textContent = a.location || '-';
    document.getElementById('verifyChecklistDept').textContent = a.department || 'Department';

    // Photos
    const pCitizen = document.getElementById('verifyPhotoCitizen');
    const pArrival = document.getElementById('verifyPhotoArrival');
    const pComp = document.getElementById('verifyPhotoCompletion');

    pCitizen.innerHTML = a.evidenceImageData
        ? `<img src="${a.evidenceImageData}" class="img-fluid rounded border" style="max-height:160px;object-fit:cover">`
        : '<span class="text-muted small">No photo attached</span>';

    pArrival.innerHTML = a.startEvidenceImageData
        ? `<img src="${a.startEvidenceImageData}" class="img-fluid rounded border" style="max-height:160px;object-fit:cover">`
        : '<span class="text-muted small">No arrival photo submitted</span>';

    pComp.innerHTML = a.completionEvidenceImageData
        ? `<img src="${a.completionEvidenceImageData}" class="img-fluid rounded border" style="max-height:160px;object-fit:cover">`
        : '<span class="text-muted small">No completion photo submitted</span>';

    const aiBadge = document.getElementById('verifyAiQaBadge');
    if (a.aiVerificationScore) {
        aiBadge.style.display = 'inline-block';
        aiBadge.textContent = `AI QA Score: ${a.aiVerificationScore}%`;
    } else {
        aiBadge.style.display = 'none';
    }

    // Render Department Checklist
    renderVerificationChecklist(a.department || 'Road Maintenance');

    document.getElementById('officerVerificationRemarks').value = '';
}

function renderVerificationChecklist(dept) {
    const container = document.getElementById('deptVerificationChecklistContainer');
    let items = [];

    if (dept === 'Road Maintenance') {
        items = [
            "Surface leveling and grade alignment verified against road bed",
            "Bituminous asphalt compaction density inspected and confirmed",
            "Joints sealed and edges raked smooth with adjacent pavement",
            "Debris, gravel and equipment cleared from traffic lanes",
            "Traffic flow safely restored without vehicular hazards"
        ];
    } else if (dept === 'Water Supply') {
        items = [
            "Pipeline leakage completely halted under live water pressure",
            "Replacement collar clamp / pipe segment bolted to standard torque",
            "Potable water supply pressure restored to normal operating levels",
            "Underground excavation backfilled and compacted safely",
            "Water clarity and chlorination inspected with zero contamination"
        ];
    } else if (dept === 'Electrical Maintenance') {
        items = [
            "All luminaires fully illuminated with timer/sensor functioning",
            "Cable joints insulated with dielectric heat-shrink tubing",
            "Junction box door grounded, latched and secured against water ingress",
            "Megger dielectric insulation resistance test passed (> 2 MΩ)",
            "High voltage safety lockouts removed and circuit breakers energized"
        ];
    } else if (dept === 'Sanitation and Waste Management') {
        items = [
            "Solid waste bulk dump 100% lifted and removed from location",
            "Surrounding road surface swept, raked and cleared of residual litter",
            "Area disinfected with bleaching lime powder to prevent odor/pests",
            "Authorized landfill weighbridge slip verified and geo-tagged",
            "Pedestrian access and public cleanliness fully restored"
        ];
    } else {
        items = [
            "Physical inspection of completed work conducted on site",
            "Work executed according to municipal engineering standards",
            "Public safety restored and site left in clean condition"
        ];
    }

    container.innerHTML = '<div class="row g-2">';
    items.forEach((item, idx) => {
        container.innerHTML += `
            <div class="col-md-6">
                <div class="form-check">
                    <input class="form-check-input verify-check" type="checkbox" id="vcheck_${idx}" checked>
                    <label class="form-check-label small text-dark" for="vcheck_${idx}">
                        ${item}
                    </label>
                </div>
            </div>
        `;
    });
    container.innerHTML += '</div>';
}

async function submitVerification(decision) {
    const assignmentId = document.getElementById('verificationAssignmentId').value;
    const remarks = document.getElementById('officerVerificationRemarks').value.trim();

    if (!remarks) {
        ui.error("Please provide officer inspection remarks.");
        return;
    }

    if (decision === 'REJECTED_REWORK') {
        if (!confirm("Are you sure you want to request rework? The task will return to IN_PROGRESS and the contractor will be instructed to rectify deficiencies.")) {
            return;
        }
    }

    ui.showLoader(decision === 'APPROVED' ? "Approving and resolving complaint..." : "Submitting rework order...");
    try {
        const res = await apiFetch(`/officer/assignments/${assignmentId}/verify`, {
            method: 'POST',
            body: JSON.stringify({
                verificationStatus: decision,
                remarks
            })
        });

        if (res && res.ok) {
            ui.success(decision === 'APPROVED' ? "Grievance verified and officially RESOLVED!" : "Rework requested from contractor.");
            verificationModal.hide();
            loadComplaints();
        } else {
            const err = res ? await res.text() : 'Verification failed';
            ui.error(err || "Failed to submit verification.");
        }
    } catch (e) {
        ui.error("Error processing verification.");
    } finally {
        ui.hideLoader();
    }
}

// ── Close Complaint ──────────────────────────────────────────────────────────
async function closeComplaint(complaintId) {
    if (!confirm(`Close complaint #${complaintId}? This will mark it as CLOSED.`)) return;
    ui.showLoader("Closing complaint...");
    try {
        const res = await apiFetch(`/officer/complaints/${complaintId}/status?status=CLOSED`, { method: 'PUT' });
        if (res && res.ok) {
            ui.success("Complaint closed successfully!");
            loadComplaints();
        } else {
            const msg = res ? await res.text() : 'Close failed';
            ui.error(msg || "Failed to close complaint.");
        }
    } catch (e) {
        ui.error("An error occurred while closing.");
    } finally {
        ui.hideLoader();
    }
}

// ── Officer AI Action Plan Modal ─────────────────────────────────────────────
async function openOfficerAiModal(complaintIdOrTitle, encCat, encDesc) {
    let title = 'Civic Issue';
    let category = 'Road Maintenance';
    let description = '';

    if (typeof complaintIdOrTitle === 'number' || !isNaN(Number(complaintIdOrTitle))) {
        const c = currentComplaintsList.find(x => x.complaintId === Number(complaintIdOrTitle));
        if (c) {
            title = c.title || 'Civic Issue';
            category = c.categoryName || c.aiCategory || c.aiCategoryName || 'Road Maintenance';
            description = c.description || '';
        }
    } else {
        title = decodeURIComponent(complaintIdOrTitle || 'Civic Issue');
        category = decodeURIComponent(encCat || 'Road Maintenance');
        description = decodeURIComponent(encDesc || '');
    }

    document.getElementById('aiActionPlanText').textContent = "Generating AI Resolution Plan...";
    document.getElementById('aiCitizenNoteText').value = "Generating citizen update draft...";
    
    const modal = new bootstrap.Modal(document.getElementById('officerAiModal'));
    modal.show();

    try {
        const res = await apiFetch('/ai/suggest-response', {
            method: 'POST',
            body: JSON.stringify({ title, category, description, status: 'IN_PROGRESS' })
        });
        if (res && res.ok) {
            const data = await res.json();
            document.getElementById('aiActionPlanText').textContent = data.actionPlan || "Action plan generated.";
            document.getElementById('aiCitizenNoteText').value = data.citizenNote || "";
        }
    } catch (e) {
        document.getElementById('aiActionPlanText').textContent = "1. Dispatch ward inspection squad.\n2. Review site conditions & confirm root cause.\n3. Execute fix & update complaint status.";
        document.getElementById('aiCitizenNoteText').value = "Dear Citizen, Your complaint is under review by our ward officer team.";
    }
}

// ── Move to Duplicate Flagged Section ─────────────────────────────────────────
async function markComplaintAsDuplicate(complaintId) {
    if (!confirm(`Move Complaint #${complaintId} to the Duplicate Flagged section?`)) return;
    ui.showLoader("Moving to duplicate flagged section...");
    try {
        const res = await apiFetch(`/officer/complaints/${complaintId}/duplicate`, {
            method: 'PUT',
            body: JSON.stringify({ isDuplicate: true })
        });
        if (res && res.ok) {
            ui.success(`Complaint #${complaintId} moved to Duplicate Flagged section.`);
            loadComplaints();
        } else {
            ui.error("Failed to mark complaint as duplicate.");
        }
    } catch (e) {
        ui.error("Error updating complaint duplicate status.");
    } finally {
        ui.hideLoader();
    }
}

async function unflagComplaintDuplicate(complaintId) {
    ui.showLoader("Restoring complaint...");
    try {
        const res = await apiFetch(`/officer/complaints/${complaintId}/unflag-duplicate`, {
            method: 'PUT'
        });
        if (res && res.ok) {
            ui.success(`Complaint #${complaintId} restored from Duplicate Flagged section.`);
            loadComplaints();
        } else {
            ui.error("Failed to restore complaint.");
        }
    } catch (e) {
        ui.error("Error restoring duplicate flag.");
    } finally {
        ui.hideLoader();
    }
}

// ── Confirm or Override AI Category ──────────────────────────────────────────
function openConfirmAiModal(complaintId, encCategory) {
    const category = decodeURIComponent(encCategory || '');
    document.getElementById('aiComplaintIdToConfirm').value = complaintId;
    document.getElementById('suggestedCategoryDisplay').value = category || 'AI Suggestion';
    document.getElementById('categoryOverrideInput').value = '';
    const modal = new bootstrap.Modal(document.getElementById('confirmAiModal'));
    modal.show();
}

async function submitConfirmAiCategory() {
    const complaintId = document.getElementById('aiComplaintIdToConfirm').value;
    const overrideVal = document.getElementById('categoryOverrideInput').value.trim();
    ui.showLoader("Confirming AI category...");
    try {
        const body = overrideVal ? { category: overrideVal } : {};
        const res = await apiFetch(`/officer/complaints/${complaintId}/confirm-ai-category`, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
        if (res && res.ok) {
            ui.success("AI Category confirmed / updated!");
            const modalEl = document.getElementById('confirmAiModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
            loadComplaints();
        } else {
            const msg = res ? await res.text() : 'Failed';
            ui.error(msg || "Could not confirm category.");
        }
    } catch (e) {
        ui.error("Error confirming category.");
    } finally {
        ui.hideLoader();
    }
}
