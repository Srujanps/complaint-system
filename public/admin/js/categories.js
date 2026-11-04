document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('token') || localStorage.getItem('role') !== 'ADMIN') {
        window.location.href = '../login.html';
        return;
    }
    loadNavbar('navbar-placeholder', { rootPath: '../', activeLink: 'admin' });
    
    loadCategories();

    const categoryForm = document.getElementById('categoryForm');
    categoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = {
            name: document.getElementById('catName').value,
            description: document.getElementById('catDesc').value,
            baseSeverityWeight: parseInt(document.getElementById('catWeight').value)
        };

        ui.showLoader("Creating Category...");
        try {
            const res = await apiFetch('/admin/categories', {
                method: 'POST',
                body: JSON.stringify(body)
            });

            if (res && res.ok) {
                ui.success("Category created successfully!");
                categoryForm.reset();
                loadCategories();
            } else {
                const msg = res ? await res.text() : 'Error creating category';
                ui.error(msg);
            }
        } catch (e) {
            ui.error("An error occurred");
        } finally {
            ui.hideLoader();
        }
    });

});

async function loadCategories() {
    const tbody = document.getElementById('categoriesTableBody');
    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4"><div class="spinner-border text-primary" role="status"></div></td></tr>';

    try {
        const res = await apiFetch('/admin/categories', { method: 'GET' });
        if (res && res.ok) {
            const categories = await res.json();
            if (categories.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No categories exist yet.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            categories.forEach(c => {
                tbody.innerHTML += `
                    <tr>
                        <td class="ps-4">#${c.categoryId}</td>
                        <td>
                            <div class="fw-bold">${c.name}</div>
                            <small class="text-muted">${c.description}</small>
                        </td>
                        <td>${c.baseSeverityWeight}</td>
                        <td class="text-end pe-4">
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${c.categoryId})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-danger">Failed to load categories.</td></tr>';
    }
}

async function deleteCategory(id) {
    if (!confirm("Are you sure you want to delete this category?")) return;
    ui.showLoader("Deleting...");
    try {
        const res = await apiFetch(`/admin/categories/${id}`, { method: 'DELETE' });
        if (res && res.ok) {
            ui.success("Category deleted.");
            loadCategories();
        } else {
            ui.error("Failed to delete category.");
        }
    } catch (e) {
        ui.error("Error deleting category.");
    } finally {
        ui.hideLoader();
    }
}
