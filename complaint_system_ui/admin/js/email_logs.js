document.addEventListener("DOMContentLoaded", () => {
    if (typeof loadNavbar === 'function') {
        loadNavbar('navbar-placeholder', { rootPath: '../', activeLink: 'admin' });
    }

    loadEmailLogs();
    loadAdminSettings();

    window.addEventListener('languageChanged', () => {
        if (window.i18n) window.i18n.applyToPage();
    });

    const form = document.getElementById("adminSettingsForm");
    if (form) {
        form.addEventListener("submit", saveAdminSettings);
    }
});

async function loadEmailLogs() {
    const tbody = document.getElementById("adminLogsTableBody");
    if (!tbody) return;

    try {
        const pageData = await API.get('/admin/notifications/logs?page=0&size=50');
        const logs = pageData ? (pageData.content || pageData) : [];

        if (!logs || logs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No notification logs recorded yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = logs.map(l => {
            const time = l.sentAt ? new Date(l.sentAt).toLocaleString() : 'Recent';
            const statusBadge = l.status === 'DELIVERED' ? 
                '<span class="badge bg-success">Delivered</span>' : 
                `<span class="badge bg-danger" title="${escapeHtml(l.failureReason || '')}">Failed</span>`;

            const retryBtn = l.status === 'FAILED' ? 
                `<button class="btn btn-sm btn-outline-warning" onclick="retryEmail(${l.id})">Retry</button>` : 
                '<span class="text-muted small">OK</span>';

            return `
                <tr>
                    <td><small class="text-muted">${time}</small></td>
                    <td><strong>${escapeHtml(l.recipientEmail)}</strong></td>
                    <td><span class="badge bg-light text-dark">${l.complaintRef || '-'}</span></td>
                    <td><span class="badge bg-primary">${l.notificationType}</span></td>
                    <td>${statusBadge}</td>
                    <td>${retryBtn}</td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error("Logs load error:", err);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-danger">Failed to load email logs: ${err.message}</td></tr>`;
    }
}

async function retryEmail(id) {
    try {
        ui.showLoader("Retrying email notification...");
        await API.post(`/admin/notifications/logs/${id}/retry`);
        ui.hideLoader();
        ui.success("Email retry command sent successfully!");
        loadEmailLogs();
    } catch (err) {
        ui.hideLoader();
        ui.error("Retry failed: " + err.message);
    }
}

async function loadAdminSettings() {
    try {
        const settings = await API.get('/admin/notifications/settings');
        if (!settings) return;

        document.getElementById("notifySpike").checked = settings.notifySpike !== false;
        document.getElementById("notifyAiFailure").checked = settings.notifyAiFailure !== false;
        document.getElementById("notifyTranslationFailure").checked = settings.notifyTranslationFailure !== false;
        document.getElementById("notifyEmailFailure").checked = settings.notifyEmailFailure !== false;
        document.getElementById("notifySlaBreachRate").checked = settings.notifySlaBreachRate !== false;
        document.getElementById("notifyDuplicateCluster").checked = settings.notifyDuplicateCluster !== false;
        document.getElementById("notifyGeographicConcentration").checked = settings.notifyGeographicConcentration !== false;
    } catch (err) {
        console.warn("Admin settings load error:", err);
    }
}

async function saveAdminSettings(e) {
    e.preventDefault();
    try {
        const body = {
            notifySpike: document.getElementById("notifySpike").checked,
            notifyAiFailure: document.getElementById("notifyAiFailure").checked,
            notifyTranslationFailure: document.getElementById("notifyTranslationFailure").checked,
            notifyEmailFailure: document.getElementById("notifyEmailFailure").checked,
            notifySlaBreachRate: document.getElementById("notifySlaBreachRate").checked,
            notifyDuplicateCluster: document.getElementById("notifyDuplicateCluster").checked,
            notifyGeographicConcentration: document.getElementById("notifyGeographicConcentration").checked
        };

        await API.put('/admin/notifications/settings', body);
        ui.success("Admin alert settings updated!");
    } catch (err) {
        ui.error("Failed to save alert settings: " + err.message);
    }
}

function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
