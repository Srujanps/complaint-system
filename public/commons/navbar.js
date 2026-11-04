/**
 * Loads the common navbar into a container.
 * @param {string} containerId - The ID of the container element.
 * @param {object} options - Configuration options.
 * @param {string} options.rootPath - Path to the root directory (e.g. './' or '../').
 * @param {string} options.activeLink - The active link identifier.
 */
function loadNavbar(containerId, options = {}) {
    const rootPath = options.rootPath || './';
    const activeLink = options.activeLink || '';
    const role = localStorage.getItem('role') || '';

    let menuItems = '';

    if (role === 'ADMIN') {
        menuItems = `
            <li class="nav-item">
                <a class="nav-link ${activeLink === 'dashboard' ? 'active' : ''}" href="${rootPath}dashboard.html" data-i18n-key="nav_dashboard">Dashboard</a>
            </li>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle ${activeLink === 'admin' ? 'active' : ''}" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Admin Tools
                </a>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="${rootPath}admin/users.html" data-i18n-key="nav_manage_users">Manage Users</a></li>
                    <li><a class="dropdown-item" href="${rootPath}admin/categories.html" data-i18n-key="nav_manage_categories">Manage Categories</a></li>
                    <li><a class="dropdown-item" href="${rootPath}admin/contracts.html"><i class="bi bi-file-earmark-text-fill me-1 text-danger"></i> Vendor Contracts</a></li>
                    <li><a class="dropdown-item" href="${rootPath}admin/email_logs.html" data-i18n-key="nav_email_logs"><i class="bi bi-envelope-paper me-1 text-primary"></i> Email Notification Logs</a></li>
                </ul>
            </li>
        `;
    } else if (role === 'CITIZEN') {
        menuItems = `
            <li class="nav-item">
                <a class="nav-link ${activeLink === 'dashboard' ? 'active' : ''}" href="${rootPath}dashboard.html" data-i18n-key="nav_dashboard">Dashboard</a>
            </li>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle ${activeLink === 'citizen' ? 'active' : ''}" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Complaints
                </a>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="${rootPath}citizen/submit_complaint.html" data-i18n-key="nav_log_complaint">Log a Complaint</a></li>
                    <li><a class="dropdown-item" href="${rootPath}citizen/my_complaints.html" data-i18n-key="nav_my_complaints">Track My Complaints</a></li>
                </ul>
            </li>
        `;
    } else if (role === 'OFFICER') {
        menuItems = `
            <li class="nav-item">
                <a class="nav-link ${activeLink === 'dashboard' ? 'active' : ''}" href="${rootPath}dashboard.html" data-i18n-key="nav_dashboard">Dashboard</a>
            </li>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle ${activeLink === 'officer' ? 'active' : ''}" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Officer Tools
                </a>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="${rootPath}officer/manage_complaints.html" data-i18n-key="nav_assign_complaints">Assign Complaints</a></li>
                </ul>
            </li>
        `;
    } else if (role === 'VENDOR') {
        menuItems = `
            <li class="nav-item">
                <a class="nav-link ${activeLink === 'dashboard' ? 'active' : ''}" href="${rootPath}dashboard.html" data-i18n-key="nav_dashboard">Dashboard</a>
            </li>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle ${activeLink === 'vendor' ? 'active' : ''}" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Vendor Tasks
                </a>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="${rootPath}vendor/tasks.html" data-i18n-key="nav_my_tasks">My Assigned Tasks</a></li>
                    <li><a class="dropdown-item" href="${rootPath}vendor/tasks.html#contracts" onclick="if(window.openMyContractsModal){window.openMyContractsModal();}"><i class="bi bi-file-earmark-check me-1 text-primary"></i> My Contracts</a></li>
                </ul>
            </li>
        `;
    } else if (role === 'REPRESENTATIVE') {
        const constituency = localStorage.getItem('constituency') || 'My Area';
        const designation  = localStorage.getItem('designation')  || 'Representative';
        menuItems = `
            <li class="nav-item">
                <a class="nav-link ${activeLink === 'dashboard' ? 'active' : ''}" href="${rootPath}dashboard.html" data-i18n-key="nav_dashboard">Dashboard</a>
            </li>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle ${activeLink === 'representative' ? 'active' : ''}" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-building-fill-check me-1"></i>${designation} Tools
                </a>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="${rootPath}representative/area_complaints.html" data-i18n-key="nav_area_complaints">
                        <i class="bi bi-geo-alt-fill me-2 text-danger"></i>Area Complaints
                        <span class="badge ms-2" style="background:#ff6f00;font-size:0.65rem">${constituency}</span>
                    </a></li>
                </ul>
            </li>
        `;
    }

    const currentLang = (localStorage.getItem('preferred_language') || 'EN').toUpperCase();

    const navbarHtml = `
    <nav class="navbar navbar-expand-lg sticky-top">
        <div class="container">
            <!-- Logo -->
            <a class="navbar-brand d-flex align-items-center gap-2" href="${rootPath}dashboard.html">
                <img src="${rootPath}assets/logo.png" alt="Complaint System Logo">
                <span class="fw-bold text-dark fs-5" data-i18n-key="nav_portal_title">Grievance Hub</span>
            </a>

            <!-- Mobile Toggle -->
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent"
                aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <!-- Main Menu -->
            <div class="collapse navbar-collapse" id="navbarContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-4">
                    ${menuItems}
                </ul>

                <div class="d-flex align-items-center gap-3">
                    <!-- Global Language Dropdown Bar -->
                    <div class="d-flex align-items-center gap-1 bg-white px-2 py-1 rounded border shadow-sm">
                        <i class="bi bi-translate text-primary fs-6"></i>
                        <select class="form-select form-select-sm border-0 bg-transparent fw-semibold i18n-lang-select" id="navLangSelect" onchange="window.i18n ? window.i18n.setLanguage(this.value) : localStorage.setItem('preferred_language', this.value);" style="width: auto; cursor: pointer;">
                            <option value="en">English</option>
                            <option value="kn">ಕನ್ನಡ</option>
                            <option value="hi">हिंदी</option>
                            <option value="te">తెలుగు</option>
                            <option value="ta">தமிழ்</option>
                        </select>
                    </div>

                    <!-- Profile Dropdown -->
                    <div class="dropdown">
                        <button class="profile-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <div class="profile-icon">
                                <i class="bi bi-person-fill"></i>
                            </div>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><h6 class="dropdown-header"><span data-i18n-key="nav_welcome">Welcome</span>, ${localStorage.getItem('username') || role}</h6></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-danger" href="#" onclick="logoutUser()"><i class="bi bi-box-arrow-right me-2"></i><span data-i18n-key="nav_logout">Logout</span></a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </nav>
    `;

    document.getElementById(containerId).innerHTML = navbarHtml;
    if (window.i18n) window.i18n.applyToPage();
}


function logoutUser() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('constituency');
    localStorage.removeItem('designation');
    window.location.href = '/login.html'; 
}
