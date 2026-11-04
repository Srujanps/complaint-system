document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = 'login.html'; return; }

    const role = localStorage.getItem('role') || 'UNKNOWN';
    const username = localStorage.getItem('username') || 'User';

    const roleLabels = { ADMIN: 'Admin', CITIZEN: 'Citizen', OFFICER: 'Officer', VENDOR: 'Field Vendor', REPRESENTATIVE: 'Representative' };
    const titleElem = document.getElementById('welcomeTitle');
    if (titleElem) titleElem.innerText = `${roleLabels[role] || role} Dashboard`;

    loadNavbar('navbar-placeholder', { rootPath: './', activeLink: 'dashboard' });
    loadDashboardContent(role);

    window.addEventListener('languageChanged', () => {
        if (window.i18n) window.i18n.applyToPage();
    });
});

async function loadDashboardContent(role) {
    const content = document.getElementById('dashboardContent');
    const charts = document.getElementById('chartsContainer');

    if (role === 'ADMIN') {
        content.innerHTML = '<div class="text-center py-3"><div class="spinner-border text-warning"></div></div>';
        try {
            const res = await apiFetch('/admin/statistics', { method: 'GET' });
            if (res && res.ok) {
                const data = await res.json();
                renderAdminDashboard(data, content, charts);
            } else {
                content.innerHTML = '<div class="alert alert-danger">Failed to load statistics.</div>';
            }
        } catch (e) {
            content.innerHTML = '<div class="alert alert-danger">Network error. Is the backend running?</div>';
        }
    } else if (role === 'CITIZEN') {
        renderCitizenDashboard(content);
    } else if (role === 'OFFICER') {
        renderOfficerDashboard(content, charts);
    } else if (role === 'VENDOR') {
        renderVendorDashboard(content, charts);
    } else if (role === 'REPRESENTATIVE') {
        renderRepresentativeDashboard(content, charts);
    }
}

function renderAdminDashboard(data, contentDiv, chartsContainer) {
    const totalComplaints = data.complaints?.total || 0;
    const totalCategories = data.totalCategories || 0;
    let totalUsers = 0, vendorCount = 0, citizenCount = 0, officerCount = 0, adminCount = 0;

    if (data.users) {
        Object.keys(data.users).forEach(k => {
            const v = parseInt(data.users[k]) || 0;
            totalUsers += v;
            if (k === 'VENDOR') vendorCount = v;
            if (k === 'CITIZEN') citizenCount = v;
            if (k === 'OFFICER') officerCount = v;
            if (k === 'ADMIN') adminCount = v;
        });
    }

    contentDiv.innerHTML = `
        <div class="row g-3 mb-4">
            <div class="col-6 col-md-3">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body">
                        <div class="d-flex align-items-center gap-3">
                            <div class="rounded-3 p-2" style="background:rgba(255,111,0,0.12)">
                                <i class="bi bi-exclamation-circle-fill fs-4" style="color:#ff6f00"></i>
                            </div>
                            <div>
                                <div class="text-muted small fw-semibold text-uppercase">Complaints</div>
                                <div class="fs-3 fw-bold">${totalComplaints}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body">
                        <div class="d-flex align-items-center gap-3">
                            <div class="rounded-3 p-2" style="background:rgba(30,136,229,0.12)">
                                <i class="bi bi-people-fill fs-4 text-primary"></i>
                            </div>
                            <div>
                                <div class="text-muted small fw-semibold text-uppercase">Citizens</div>
                                <div class="fs-3 fw-bold">${citizenCount}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body">
                        <div class="d-flex align-items-center gap-3">
                            <div class="rounded-3 p-2" style="background:rgba(67,160,71,0.12)">
                                <i class="bi bi-person-badge-fill fs-4 text-success"></i>
                            </div>
                            <div>
                                <div class="text-muted small fw-semibold text-uppercase">Vendors</div>
                                <div class="fs-3 fw-bold">${vendorCount}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body">
                        <div class="d-flex align-items-center gap-3">
                            <div class="rounded-3 p-2" style="background:rgba(156,39,176,0.12)">
                                <i class="bi bi-tags-fill fs-4 text-purple" style="color:#7b1fa2"></i>
                            </div>
                            <div>
                                <div class="text-muted small fw-semibold text-uppercase">Categories</div>
                                <div class="fs-3 fw-bold">${totalCategories}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row g-3 mb-4">
            <div class="col-md-4">
                <a href="admin/categories.html" class="text-decoration-none">
                    <div class="card border-0 shadow-sm" style="border-left: 4px solid #ff6f00 !important">
                        <div class="card-body d-flex align-items-center gap-3">
                            <i class="bi bi-tags fs-2" style="color:#ff6f00"></i>
                            <div>
                                <div class="fw-bold">Manage Categories</div>
                                <div class="text-muted small">Create, edit & delete complaint types</div>
                            </div>
                            <i class="bi bi-chevron-right ms-auto"></i>
                        </div>
                    </div>
                </a>
            </div>
            <div class="col-md-4">
                <a href="admin/users.html" class="text-decoration-none">
                    <div class="card border-0 shadow-sm" style="border-left: 4px solid #1e88e5 !important">
                        <div class="card-body d-flex align-items-center gap-3">
                            <i class="bi bi-people fs-2 text-primary"></i>
                            <div>
                                <div class="fw-bold">Manage Users</div>
                                <div class="text-muted small">View and delete system users</div>
                            </div>
                            <i class="bi bi-chevron-right ms-auto"></i>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    `;

    chartsContainer.style.display = 'flex';
    const opts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16 } } } };

    // User Role Distribution (Doughnut)
    new Chart(document.getElementById('activityChart').getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Citizens', 'Vendors', 'Officers', 'Admins'],
            datasets: [{ data: [citizenCount||0, vendorCount||0, officerCount||0, adminCount||0], backgroundColor: ['#ff6f00','#1e88e5','#43a047','#8e24aa'], borderWidth: 0, hoverOffset: 6 }]
        },
        options: { ...opts, cutout: '65%', plugins: { ...opts.plugins, title: { display: true, text: 'User Role Distribution', font: { size: 14, weight: 'bold' } } } }
    });

    // Complaint Volume vs Category count (Bar)
    new Chart(document.getElementById('distChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Total Complaints', 'Total Categories', 'Field Vendors', 'Officers'],
            datasets: [{
                label: 'System Stats',
                data: [totalComplaints, totalCategories, vendorCount, officerCount],
                backgroundColor: ['#ff6f00','#ff8f00','#1e88e5','#43a047'],
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: { ...opts, plugins: { ...opts.plugins, legend: { display: false }, title: { display: true, text: 'System Overview', font: { size: 14, weight: 'bold' } } }, scales: { y: { beginAtZero: true, grid: { color: '#f0f0f0' } }, x: { grid: { display: false } } } }
    });
}

function renderCitizenDashboard(contentDiv) {
    contentDiv.innerHTML = `
        <div class="row g-4">
            <div class="col-md-6">
                <a href="citizen/submit_complaint.html" class="text-decoration-none">
                    <div class="card border-0 shadow-sm text-center p-4 h-100" style="transition: transform 0.2s" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform=''">
                        <i class="bi bi-plus-circle-fill mb-3" style="font-size:3rem; color:#ff6f00"></i>
                        <h5 class="fw-bold text-dark" data-i18n-key="card_log_new_title">Log a New Complaint</h5>
                        <p class="text-muted small" data-i18n-key="card_log_new_sub">Report a civic issue in your area. Use GPS to auto-fill location.</p>
                        <span class="btn btn-primary btn-sm mt-2" data-i18n-key="card_log_new_btn">Get Started</span>
                    </div>
                </a>
            </div>
            <div class="col-md-6">
                <a href="citizen/my_complaints.html" class="text-decoration-none">
                    <div class="card border-0 shadow-sm text-center p-4 h-100" style="transition: transform 0.2s" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform=''">
                        <i class="bi bi-clock-history mb-3" style="font-size:3rem; color:#1e88e5"></i>
                        <h5 class="fw-bold text-dark" data-i18n-key="card_view_complaints_title">View My Complaints</h5>
                        <p class="text-muted small" data-i18n-key="card_view_complaints_sub">Track progress and resolution status of your submitted issues.</p>
                        <span class="btn btn-outline-primary btn-sm mt-2" data-i18n-key="card_view_complaints_btn">View History</span>
                    </div>
                </a>
            </div>
        </div>
    `;
    if (window.i18n) window.i18n.applyToPage();
}

async function renderOfficerDashboard(contentDiv, chartsContainer) {
    contentDiv.innerHTML = `
        <div class="row g-4 mb-4">
            <div class="col-md-12">
                <a href="officer/manage_complaints.html" class="text-decoration-none">
                    <div class="card border-0 shadow-sm p-4" style="border-left: 4px solid #ff6f00 !important">
                        <div class="d-flex align-items-center gap-3">
                            <i class="bi bi-kanban-fill fs-1" style="color:#ff6f00"></i>
                            <div>
                                <h5 class="fw-bold mb-1 text-dark">Assign Complaints</h5>
                                <p class="text-muted small mb-0">Review unassigned reports and delegate them to field vendors.</p>
                            </div>
                            <i class="bi bi-chevron-right fs-4 ms-auto text-muted"></i>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    `;

    // Try to load and render complaint status chart
    try {
        const res = await apiFetch('/officer/complaints?page=0&size=100', { method: 'GET' });
        if (res && res.ok) {
            const data = await res.json();
            const complaints = data.content || [];
            const counts = { RECEIVED: 0, ASSIGNED: 0, IN_PROGRESS: 0, RESOLVED: 0 };
            complaints.forEach(c => { if (counts[c.status] !== undefined) counts[c.status]++; });

            chartsContainer.style.display = 'flex';
            new Chart(document.getElementById('activityChart').getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['Received', 'Assigned', 'In Progress', 'Resolved'],
                    datasets: [{
                        label: 'Complaints',
                        data: [counts.RECEIVED, counts.ASSIGNED, counts.IN_PROGRESS, counts.RESOLVED],
                        backgroundColor: ['#90caf9','#ffcc02','#ff6f00','#43a047'],
                        borderRadius: 8, borderSkipped: false
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false }, title: { display: true, text: 'Complaints by Status', font: { size: 14, weight: 'bold' } } },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } }, x: { grid: { display: false } } }
                }
            });

            new Chart(document.getElementById('distChart').getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Received', 'Assigned', 'In Progress', 'Resolved'],
                    datasets: [{ data: [counts.RECEIVED, counts.ASSIGNED, counts.IN_PROGRESS, counts.RESOLVED], backgroundColor: ['#90caf9','#ffcc02','#ff6f00','#43a047'], borderWidth: 0, hoverOffset: 6 }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, cutout: '65%',
                    plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'Status Distribution', font: { size: 14, weight: 'bold' } } }
                }
            });
        }
    } catch (e) { /* charts optional */ }
}

async function renderVendorDashboard(contentDiv, chartsContainer) {
    contentDiv.innerHTML = `
        <div class="row g-4 mb-4">
            <div class="col-md-12">
                <a href="vendor/tasks.html" class="text-decoration-none">
                    <div class="card border-0 shadow-sm p-4" style="border-left: 4px solid #43a047 !important">
                        <div class="d-flex align-items-center gap-3">
                            <i class="bi bi-tools fs-1 text-success"></i>
                            <div>
                                <h5 class="fw-bold mb-1 text-dark">My Assigned Tasks</h5>
                                <p class="text-muted small mb-0">View and update the status of your field work assignments.</p>
                            </div>
                            <i class="bi bi-chevron-right fs-4 ms-auto text-muted"></i>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    `;

    // Try to load vendor assignments for chart
    try {
        const res = await apiFetch('/vendor/assignments', { method: 'GET' });
        if (res && res.ok) {
            const assignments = await res.json();
            let pending = 0, inProgress = 0, completed = 0;
            assignments.forEach(a => {
                if (a.status === 'ASSIGNED') pending++;
                else if (a.status === 'IN_PROGRESS') inProgress++;
                else if (a.status === 'COMPLETED' || a.status === 'RESOLVED') completed++;
            });

            const total = assignments.length;
            if (total > 0) {
                chartsContainer.style.display = 'flex';
                new Chart(document.getElementById('activityChart').getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: ['Pending', 'In Progress', 'Completed'],
                        datasets: [{ data: [pending, inProgress, completed], backgroundColor: ['#ffcc02','#ff6f00','#43a047'], borderWidth: 0, hoverOffset: 6 }]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false, cutout: '65%',
                        plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'My Task Progress', font: { size: 14, weight: 'bold' } } }
                    }
                });

                new Chart(document.getElementById('distChart').getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: ['Total Assigned', 'Pending', 'In Progress', 'Completed'],
                        datasets: [{
                            label: 'Tasks',
                            data: [total, pending, inProgress, completed],
                            backgroundColor: ['#1e88e5','#ffcc02','#ff6f00','#43a047'],
                            borderRadius: 8, borderSkipped: false
                        }]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { display: false }, title: { display: true, text: 'Assignment Summary', font: { size: 14, weight: 'bold' } } },
                        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } }, x: { grid: { display: false } } }
                    }
                });
            }
        }
    } catch (e) { /* charts optional */ }
}

async function renderRepresentativeDashboard(contentDiv, chartsContainer) {
    const constituency = localStorage.getItem('constituency') || 'Your Area';
    const designation  = localStorage.getItem('designation')  || 'Representative';

    contentDiv.innerHTML = `
        <div class="row g-4 mb-4">
            <div class="col-md-12">
                <a href="representative/area_complaints.html" class="text-decoration-none">
                    <div class="card border-0 shadow-sm p-4" style="border-left: 4px solid #5c35cc !important">
                        <div class="d-flex align-items-center gap-3">
                            <i class="bi bi-building-fill-check fs-1" style="color:#5c35cc"></i>
                            <div>
                                <h5 class="fw-bold mb-1 text-dark">Area Complaints — ${constituency}</h5>
                                <p class="text-muted small mb-0">Monitor, escalate, endorse and set priority for complaints in your constituency.</p>
                            </div>
                            <i class="bi bi-chevron-right fs-4 ms-auto text-muted"></i>
                        </div>
                    </div>
                </a>
            </div>
        </div>
        <div class="row g-3 mb-4" id="repStatCards">
            <div class="col-6 col-md-3"><div class="card border-0 shadow-sm h-100"><div class="card-body"><div class="text-muted small fw-semibold text-uppercase">Total</div><div class="fs-3 fw-bold" id="rdTotal">–</div></div></div></div>
            <div class="col-6 col-md-3"><div class="card border-0 shadow-sm h-100"><div class="card-body"><div class="text-muted small fw-semibold text-uppercase">Pending</div><div class="fs-3 fw-bold text-warning" id="rdPending">–</div></div></div></div>
            <div class="col-6 col-md-3"><div class="card border-0 shadow-sm h-100"><div class="card-body"><div class="text-muted small fw-semibold text-uppercase">Escalated</div><div class="fs-3 fw-bold text-danger" id="rdEscalated">–</div></div></div></div>
            <div class="col-6 col-md-3"><div class="card border-0 shadow-sm h-100"><div class="card-body"><div class="text-muted small fw-semibold text-uppercase">Resolved</div><div class="fs-3 fw-bold text-success" id="rdResolved">–</div></div></div></div>
        </div>`;

    try {
        const res = await apiFetch('/representative/complaints/stats', { method: 'GET' });
        if (res && res.ok) {
            const data = await res.json();
            const el = id => document.getElementById(id);
            if(el('rdTotal'))     el('rdTotal').textContent     = data.total     ?? '–';
            if(el('rdPending'))   el('rdPending').textContent   = data.pending   ?? '–';
            if(el('rdEscalated')) el('rdEscalated').textContent = data.escalated ?? '–';
            if(el('rdResolved'))  el('rdResolved').textContent  = data.resolved  ?? '–';

            const byStatus = data.byStatus || {};
            const statuses = ['CREATED','VERIFIED','ASSIGNED','IN_PROGRESS','RESOLVED','ESCALATED','CLOSED'];
            const counts   = statuses.map(s => byStatus[s] || 0);
            const colors   = ['#90caf9','#64b5f6','#1e88e5','#ff6f00','#43a047','#ff1744','#212529'];

            chartsContainer.style.display = 'flex';
            new Chart(document.getElementById('activityChart').getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Submitted','Verified','Assigned','In Progress','Resolved','Escalated','Closed'],
                    datasets: [{ data: counts, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, cutout: '65%',
                    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12 } },
                        title: { display: true, text: `Area Status — ${constituency}`, font: { size: 14, weight: 'bold' } } }
                }
            });

            new Chart(document.getElementById('distChart').getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['Submitted','Verified','Assigned','In Prog.','Resolved','Escalated','Closed'],
                    datasets: [{ label: 'Complaints', data: counts, backgroundColor: colors, borderRadius: 6, borderSkipped: false }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false }, title: { display: true, text: 'Complaints by Stage', font: { size: 14, weight: 'bold' } } },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } }, x: { grid: { display: false } } }
                }
            });
        }
    } catch (e) { /* charts optional */ }
}
