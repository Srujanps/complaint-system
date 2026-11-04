/**
 * UI Utilities for Loader, Toast Notifications, and Auth Error Handling
 */

// Loader Functions
function showLoader(message = "Loading...") {
    if (document.getElementById('global-loader')) return;

    const loaderHTML = `
        <div id="global-loader" class="loader-overlay">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <div class="loader-text">${message}</div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', loaderHTML);
}

function hideLoader() {
    const loader = document.getElementById('global-loader');
    if (loader) loader.remove();
}

// Toast Functions
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = {
        success: 'bi-check-circle-fill',
        error: 'bi-exclamation-circle-fill',
        warning: 'bi-exclamation-triangle-fill',
        info: 'bi-info-circle-fill'
    };

    const iconClass = icons[type] || icons.info;

    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;
    toast.innerHTML = `
        <div class="custom-toast-content">
            <span style="font-weight: 600; font-size: 1.1em; margin-right: 5px;">&#9432;</span>
            <span>${message}</span>
        </div>
        <div class="custom-toast-close" onclick="this.parentElement.remove()">&times;</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        toast.addEventListener('animationend', () => {
            if (toast.parentElement) toast.remove();
        });
    }, 3000);
}

/**
 * Check if an API response indicates an invalid/expired token.
 */
function checkAuthError(data, loginPath = '/login.html') {
    if (!data) return false;
    const msg = (data.message || '').toLowerCase();
    const isAuthError = (
        msg.includes('invalid token') ||
        msg.includes('expired') ||
        msg.includes('unauthorized') ||
        msg.includes('full authentication is required') ||
        data.status === 401 ||
        data.status === 403
    );
    if (isAuthError) {
        hideLoader();
        localStorage.removeItem('token');
        showToast('Session expired. Please log in again.', 'warning');
        setTimeout(() => { window.location.href = loginPath; }, 1500);
        return true;
    }
    return false;
}

// Global ui object
window.ui = {
    showLoader,
    hideLoader,
    success: (msg) => showToast(msg, 'success'),
    error: (msg) => showToast(msg, 'error'),
    warning: (msg) => showToast(msg, 'warning'),
    info: (msg) => showToast(msg, 'info'),
    checkAuthError: (data, path) => checkAuthError(data, path),
};
