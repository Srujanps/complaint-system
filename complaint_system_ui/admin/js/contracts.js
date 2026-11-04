let contracts = [];
let vendors = [];
let currentDeptFilter = 'ALL';
let contractModal;
let viewContractModal;
let docBase64 = null;
let docFileName = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('token') || localStorage.getItem('role') !== 'ADMIN') {
        window.location.href = '../login.html';
        return;
    }
    loadNavbar('navbar-placeholder', { rootPath: '../', activeLink: 'admin' });

    contractModal = new bootstrap.Modal(document.getElementById('contractModal'));
    viewContractModal = new bootstrap.Modal(document.getElementById('viewContractModal'));

    loadVendors();
    loadContracts();

    // File input handler for contract document
    const docInput = document.getElementById('modalContractDocInput');
    if (docInput) {
        docInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                docFileName = file.name;
                const reader = new FileReader();
                reader.onload = () => {
                    docBase64 = reader.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    const form = document.getElementById('contractForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveContract();
    });
});

async function loadVendors() {
    try {
        const res = await apiFetch('/admin/users/role/VENDOR', { method: 'GET' });
        if (res && res.ok) {
            vendors = await res.json();
            const select = document.getElementById('modalVendorSelect');
            select.innerHTML = '<option value="">-- Choose Contractor --</option>';
            vendors.forEach(v => {
                const opt = document.createElement('option');
                opt.value = v.userId || v.id;
                const spec = v.designation ? ` [${v.designation}]` : '';
                opt.textContent = `${v.fullName || v.username} (@${v.username})${spec}`;
                select.appendChild(opt);
            });
        }
    } catch (e) {
        console.error('Failed to load vendors', e);
    }
}

async function loadContracts() {
    const tbody = document.getElementById('contractsTableBody');
    tbody.innerHTML = '<tr><td colspan="9" class="text-center py-4"><div class="spinner-border text-danger" role="status"></div></td></tr>';

    try {
        const res = await apiFetch('/contracts', { method: 'GET' });
        if (res && res.ok) {
            contracts = await res.json();
            applyFilters();
        } else {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center py-4 text-danger">Failed to load contracts.</td></tr>';
        }
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center py-4 text-danger">Error connecting to contract registry.</td></tr>';
    }
}

function filterDepartment(dept) {
    currentDeptFilter = dept;
    document.getElementById('deptFilterAll').classList.toggle('active', dept === 'ALL');
    document.getElementById('deptFilterRoad').classList.toggle('active', dept === 'Road Maintenance');
    document.getElementById('deptFilterWater').classList.toggle('active', dept === 'Water Supply');
    document.getElementById('deptFilterElectric').classList.toggle('active', dept === 'Electrical Maintenance');
    document.getElementById('deptFilterSanitation').classList.toggle('active', dept === 'Sanitation and Waste Management');
    applyFilters();
}

function applyFilters() {
    const statusVal = document.getElementById('statusFilter').value;
    const searchVal = document.getElementById('searchContractInput').value.trim().toLowerCase();

    let filtered = contracts.filter(c => {
        // Department filter
        if (currentDeptFilter !== 'ALL' && c.department !== currentDeptFilter) {
            return false;
        }
        // Status filter
        if (statusVal !== 'ALL' && c.status !== statusVal) {
            return false;
        }
        // Search filter
        if (searchVal) {
            const num = (c.contractNumber || '').toLowerCase();
            const title = (c.contractTitle || '').toLowerCase();
            const vendor = (c.vendorName || c.vendorUsername || '').toLowerCase();
            const wards = (c.coveredWards || '').toLowerCase();
            if (!num.contains(searchVal) && !title.contains(searchVal) && !vendor.contains(searchVal) && !wards.contains(searchVal)) {
                return false;
            }
        }
        return true;
    });

    renderContractsTable(filtered);
}

function renderContractsTable(list) {
    const tbody = document.getElementById('contractsTableBody');
    const badge = document.getElementById('contractCountBadge');
    badge.textContent = `${list.length} Contracts`;

    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center py-4 text-muted">No contracts matching the selected filters.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    list.forEach(c => {
        let statusBadge = 'bg-success';
        if (c.status === 'EXPIRED') statusBadge = 'bg-secondary';
        if (c.status === 'SUSPENDED') statusBadge = 'bg-warning text-dark';
        if (c.status === 'TERMINATED') statusBadge = 'bg-danger text-white';

        let deptBadge = 'bg-secondary';
        if (c.department.includes('Road')) deptBadge = 'bg-dark';
        if (c.department.includes('Water')) deptBadge = 'bg-info text-dark';
        if (c.department.includes('Electric')) deptBadge = 'bg-warning text-dark';
        if (c.department.includes('Sanitation')) deptBadge = 'bg-success';

        const valFormatted = c.contractValue ? `₹${c.contractValue.toLocaleString('en-IN')}` : '₹0';
        const docBadge = c.documentData ? `<span class="badge bg-light text-primary border ms-1"><i class="bi bi-paperclip"></i> Doc</span>` : '';

        tbody.innerHTML += `
            <tr>
                <td class="ps-3 fw-bold text-danger">
                    ${c.contractNumber || ('CNT-ID-' + c.contractId)}
                    ${docBadge}
                </td>
                <td>
                    <div class="fw-bold text-dark">${c.vendorName || c.vendorUsername}</div>
                    <small class="text-muted"><i class="bi bi-person me-1"></i>@${c.vendorUsername} | ${c.vendorPhone || '-'}</small>
                </td>
                <td><span class="badge ${deptBadge}">${c.department}</span></td>
                <td><small class="text-truncate d-inline-block" style="max-width: 140px;">${c.coveredWards || 'All Wards'}</small></td>
                <td><span class="badge bg-light text-dark border">${c.contractSlaHours}h Target</span></td>
                <td class="fw-semibold text-dark">${valFormatted}</td>
                <td>
                    <div class="small">${c.startDate || '-'}</div>
                    <small class="text-muted">to ${c.expiryDate || '-'}</small>
                </td>
                <td><span class="badge ${statusBadge}">${c.status}</span></td>
                <td class="text-end pe-3">
                    <button class="btn btn-sm btn-outline-dark me-1" onclick="viewContract(${c.contractId})" title="View Details"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editContract(${c.contractId})" title="Edit Contract"><i class="bi bi-pencil"></i></button>
                    <div class="btn-group btn-group-sm">
                        <button type="button" class="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">Status</button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item text-success" href="#" onclick="changeStatus(${c.contractId}, 'ACTIVE')"><i class="bi bi-check-circle me-1"></i> Activate</a></li>
                            <li><a class="dropdown-item text-warning" href="#" onclick="changeStatus(${c.contractId}, 'SUSPENDED')"><i class="bi bi-pause-circle me-1"></i> Suspend</a></li>
                            <li><a class="dropdown-item text-secondary" href="#" onclick="changeStatus(${c.contractId}, 'EXPIRED')"><i class="bi bi-calendar-x me-1"></i> Mark Expired</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-danger" href="#" onclick="changeStatus(${c.contractId}, 'TERMINATED')"><i class="bi bi-slash-circle me-1"></i> Terminate</a></li>
                        </ul>
                    </div>
                </td>
            </tr>
        `;
    });
}

function openRegisterContractModal() {
    document.getElementById('contractModalTitle').innerHTML = '<i class="bi bi-file-earmark-plus me-2"></i>Register Government Contractor Agreement';
    document.getElementById('contractForm').reset();
    document.getElementById('editContractId').value = '';
    docBase64 = null;
    docFileName = null;
    document.getElementById('existingDocNotice').style.display = 'none';

    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const nextYearStr = nextYear.toISOString().split('T')[0];

    document.getElementById('modalStartDate').value = today;
    document.getElementById('modalExpiryDate').value = nextYearStr;
    document.getElementById('modalSlaHours').value = 24;
    document.getElementById('modalCoveredWards').value = 'Ward 12, Ward 13, Ward 14';

    contractModal.show();
}

function editContract(contractId) {
    const c = contracts.find(x => x.contractId === contractId);
    if (!c) return;

    document.getElementById('contractModalTitle').innerHTML = '<i class="bi bi-pencil me-2"></i>Edit Contractor Agreement: ' + c.contractNumber;
    document.getElementById('editContractId').value = c.contractId;
    document.getElementById('modalVendorSelect').value = c.vendorId;
    document.getElementById('modalDepartmentSelect').value = c.department;
    document.getElementById('modalContractTitle').value = c.contractTitle;
    document.getElementById('modalContractNumber').value = c.contractNumber;
    document.getElementById('modalContractValue').value = c.contractValue || 0;
    document.getElementById('modalStartDate').value = c.startDate || '';
    document.getElementById('modalExpiryDate').value = c.expiryDate || '';
    document.getElementById('modalCoveredWards').value = c.coveredWards || '';
    document.getElementById('modalSlaHours').value = c.contractSlaHours || 24;
    document.getElementById('modalStatusSelect').value = c.status || 'ACTIVE';
    document.getElementById('modalApprovedCategories').value = c.approvedCategories || '';
    document.getElementById('modalContractualRates').value = c.contractualRates || '';
    document.getElementById('modalWorkConditions').value = c.workConditions || '';

    docBase64 = c.documentData || null;
    docFileName = c.documentName || null;

    const notice = document.getElementById('existingDocNotice');
    if (c.documentName) {
        notice.style.display = 'block';
        notice.innerHTML = `<i class="bi bi-check-circle me-1"></i> Current Document: <strong>${c.documentName}</strong> (Upload new file to replace)`;
    } else {
        notice.style.display = 'none';
    }

    contractModal.show();
}

async function saveContract() {
    const editId = document.getElementById('editContractId').value;
    const vendorId = parseInt(document.getElementById('modalVendorSelect').value);
    const department = document.getElementById('modalDepartmentSelect').value;
    const contractTitle = document.getElementById('modalContractTitle').value.trim();
    const contractNumber = document.getElementById('modalContractNumber').value.trim();
    const contractValue = parseFloat(document.getElementById('modalContractValue').value) || 0;
    const startDate = document.getElementById('modalStartDate').value;
    const expiryDate = document.getElementById('modalExpiryDate').value;
    const coveredWards = document.getElementById('modalCoveredWards').value.trim();
    const contractSlaHours = parseInt(document.getElementById('modalSlaHours').value) || 24;
    const status = document.getElementById('modalStatusSelect').value;
    const approvedCategories = document.getElementById('modalApprovedCategories').value.trim();
    const contractualRates = document.getElementById('modalContractualRates').value.trim();
    const workConditions = document.getElementById('modalWorkConditions').value.trim();

    if (!vendorId) {
        ui.error("Please choose a vendor contractor.");
        return;
    }
    if (new Date(expiryDate) < new Date(startDate)) {
        ui.error("Expiry date cannot be earlier than start date.");
        return;
    }

    const payload = {
        vendorId,
        department,
        contractTitle,
        contractNumber: contractNumber || null,
        contractValue,
        startDate,
        expiryDate,
        coveredWards,
        contractSlaHours,
        status,
        approvedCategories,
        contractualRates,
        workConditions,
        documentName: docFileName,
        documentData: docBase64
    };

    ui.showLoader(editId ? "Updating contract..." : "Registering contractor agreement...");
    try {
        const endpoint = editId ? `/admin/contracts/${editId}` : '/admin/contracts';
        const method = editId ? 'PUT' : 'POST';

        const res = await apiFetch(endpoint, {
            method,
            body: JSON.stringify(payload)
        });

        if (res && res.ok) {
            ui.success(editId ? "Contract updated successfully!" : "Contract registered successfully!");
            contractModal.hide();
            loadContracts();
        } else {
            const err = res ? await res.text() : 'Failed';
            ui.error(err || "Operation failed.");
        }
    } catch (e) {
        ui.error("An error occurred while saving contract.");
    } finally {
        ui.hideLoader();
    }
}

async function changeStatus(contractId, newStatus) {
    if (!confirm(`Change contract status to ${newStatus}?`)) return;

    ui.showLoader("Updating status...");
    try {
        const res = await apiFetch(`/admin/contracts/${contractId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus })
        });
        if (res && res.ok) {
            ui.success(`Contract status updated to ${newStatus}`);
            loadContracts();
        } else {
            const msg = res ? await res.text() : 'Failed';
            ui.error(msg || "Failed to update status.");
        }
    } catch (e) {
        ui.error("Error updating status.");
    } finally {
        ui.hideLoader();
    }
}

function viewContract(contractId) {
    const c = contracts.find(x => x.contractId === contractId);
    if (!c) return;

    let docHtml = '<span class="text-muted">No document uploaded</span>';
    if (c.documentData) {
        docHtml = `<a href="${c.documentData}" download="${c.documentName || 'Contract_' + c.contractNumber + '.pdf'}" class="btn btn-sm btn-outline-danger"><i class="bi bi-download me-1"></i> Download Agreement (${c.documentName || 'Document'})</a>`;
    }

    const modalBody = document.getElementById('viewContractBody');
    modalBody.innerHTML = `
        <div class="border rounded p-3 bg-light mb-3">
            <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                <div>
                    <h5 class="fw-bold mb-0 text-danger">${c.contractNumber}</h5>
                    <div class="text-muted">${c.contractTitle}</div>
                </div>
                <span class="badge ${c.status === 'ACTIVE' ? 'bg-success' : 'bg-warning'} fs-6">${c.status}</span>
            </div>

            <div class="row g-3">
                <div class="col-md-6">
                    <label class="small text-muted fw-bold">AWARDED CONTRACTOR</label>
                    <div class="fw-bold text-dark">${c.vendorName} (@${c.vendorUsername})</div>
                    <div class="small text-muted"><i class="bi bi-telephone me-1"></i>${c.vendorPhone || '-'} | <i class="bi bi-envelope me-1"></i>${c.vendorEmail || '-'}</div>
                </div>
                <div class="col-md-6">
                    <label class="small text-muted fw-bold">DEPARTMENT SPECIALIZATION</label>
                    <div class="fw-bold text-primary">${c.department}</div>
                    <div class="small text-muted">Approved Categories: ${c.approvedCategories || 'General'}</div>
                </div>

                <div class="col-md-4">
                    <label class="small text-muted fw-bold">CONTRACT VALUE</label>
                    <div class="fw-bold text-dark fs-5">₹${(c.contractValue || 0).toLocaleString('en-IN')}</div>
                </div>
                <div class="col-md-4">
                    <label class="small text-muted fw-bold">VALIDITY PERIOD</label>
                    <div class="fw-bold text-dark">${c.startDate} to ${c.expiryDate}</div>
                </div>
                <div class="col-md-4">
                    <label class="small text-muted fw-bold">CONTRACTUAL SLA</label>
                    <div class="fw-bold text-danger">${c.contractSlaHours} Hours Target</div>
                </div>

                <div class="col-12">
                    <label class="small text-muted fw-bold">COVERED WARDS / SERVICE AREA</label>
                    <div class="p-2 bg-white rounded border">${c.coveredWards}</div>
                </div>

                <div class="col-12">
                    <label class="small text-muted fw-bold">CONTRACTUAL UNIT RATES</label>
                    <div class="p-2 bg-white rounded border small font-monospace">${c.contractualRates || 'Standard Schedule of Rates applies'}</div>
                </div>

                <div class="col-12">
                    <label class="small text-muted fw-bold">WORK CONDITIONS & SAFETY REQUIREMENTS</label>
                    <div class="p-2 bg-white rounded border small">${c.workConditions || 'Standard municipal engineering specifications.'}</div>
                </div>

                <div class="col-12 border-top pt-2 mt-2 d-flex justify-content-between align-items-center">
                    <span class="small text-muted">Created: ${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</span>
                    <div>${docHtml}</div>
                </div>
            </div>
        </div>
    `;

    viewContractModal.show();
}

