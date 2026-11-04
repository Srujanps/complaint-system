let addUserModal;

document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('token') || localStorage.getItem('role') !== 'ADMIN') {
        window.location.href = '../login.html';
        return;
    }
    loadNavbar('navbar-placeholder', { rootPath: '../', activeLink: 'admin' });
    
    if (document.getElementById('addUserModal')) {
        addUserModal = new bootstrap.Modal(document.getElementById('addUserModal'));
        
        document.getElementById('addUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await createUser();
        });
    }

    loadUsers();
});

function toggleRepFields() {
    const role = document.getElementById('newRole').value;
    const repFields = document.getElementById('repFields');
    if (!repFields) return;
    repFields.style.display = role === 'REPRESENTATIVE' ? 'block' : 'none';
}

function openAddUserModal() {
    document.getElementById('addUserForm').reset();
    toggleRepFields();
    addUserModal.show();
}

async function createUser() {
    const role = document.getElementById('newRole').value;
    const body = {
        role: role,
        username: document.getElementById('newUsername').value.trim(),
        password: document.getElementById('newPassword').value.trim(),
        fullName: document.getElementById('newFullName').value.trim(),
        phone: document.getElementById('newPhone').value.trim(),
        email: document.getElementById('newEmail').value.trim()
    };

    if (role === 'REPRESENTATIVE') {
        body.constituency = document.getElementById('newConstituency')?.value.trim();
        body.designation = document.getElementById('newDesignation')?.value.trim();
        if (!body.constituency) {
            ui.error("Constituency is required for Representatives");
            return;
        }
    }

    ui.showLoader("Creating User...");
    try {
        const res = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) });

        if (res.ok) {
            ui.success("User created successfully!");
            addUserModal.hide();
            loadUsers();
        } else {
            const errText = await res.text();
            ui.error(`Registration failed: ${errText || 'Unknown error'}`);
        }
    } catch (e) {
        ui.error("An error occurred while creating user.");
    } finally {
        ui.hideLoader();
    }
}

async function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4"><div class="spinner-border text-primary" role="status"></div></td></tr>';

    try {
        const res = await apiFetch('/admin/users', { method: 'GET' });
        if (res && res.ok) {
            const users = await res.json();
            if (users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No users found.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            users.forEach(u => {
                let badgeClass = 'bg-secondary';
                if (u.role === 'ADMIN') badgeClass = 'bg-danger';
                if (u.role === 'VENDOR') badgeClass = 'bg-primary';
                if (u.role === 'OFFICER') badgeClass = 'bg-dark';
                if (u.role === 'CITIZEN') badgeClass = 'bg-success';

                let repInfo = '';
                let badgeStyle = '';
                if (u.role === 'REPRESENTATIVE') {
                    repInfo = `<br><small class="text-muted"><i class="bi bi-geo-alt"></i> ${u.constituency || 'N/A'}</small>`;
                    badgeClass = 'bg-purple';
                    badgeStyle = 'style="background-color: #5c35cc"';
                }

                tbody.innerHTML += `
                    <tr>
                        <td class="ps-4">#${u.userId || u.id || '-'}</td>
                        <td>
                            <div class="fw-bold">${u.username}</div>
                        </td>
                        <td>
                            ${u.fullName || '-'}
                            ${repInfo}
                        </td>
                        <td>${u.email}</td>
                        <td>${u.phone || '-'}</td>
                        <td><span class="badge ${badgeClass}" ${badgeStyle}>${u.role}</span></td>
                        <td class="text-end pe-4">
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${u.userId || u.id})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-danger">Failed to load users.</td></tr>';
    }
}

async function deleteUser(id) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    ui.showLoader("Deleting...");
    try {
        const res = await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
        if (res && res.ok) {
            ui.success("User deleted.");
            loadUsers();
        } else {
            ui.error("Failed to delete user.");
        }
    } catch (e) {
        ui.error("Error deleting user.");
    } finally {
        ui.hideLoader();
    }
}
