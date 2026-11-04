document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (!username) { ui.error("Please enter username."); return; }
            if (!password) { ui.error("Please enter password."); return; }

            ui.showLoader("Signing In...");
            loginBtn.disabled = true;

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                if (response.ok) {
                    const result = await response.json();

                    // Save token and username
                    localStorage.setItem('token', result.token);
                    localStorage.setItem('username', result.username || username);

                    // Role detection — backend sends role directly in response
                    let role = result.role;
                    if (!role && result.token) {
                        try {
                            const payload = JSON.parse(atob(result.token.split('.')[1]));
                            let authorities = payload.roles || payload.authorities || [];
                            if (typeof authorities === 'string') authorities = authorities.split(',');
                            const authStr = authorities.join(',').toUpperCase();
                            if      (authStr.includes('ADMIN'))          role = 'ADMIN';
                            else if (authStr.includes('REPRESENTATIVE'))  role = 'REPRESENTATIVE';
                            else if (authStr.includes('OFFICER'))         role = 'OFFICER';
                            else if (authStr.includes('VENDOR'))          role = 'VENDOR';
                            else                                           role = 'CITIZEN';
                        } catch (e) {
                            console.error("Could not parse JWT", e);
                            role = 'CITIZEN';
                        }
                    }
                    localStorage.setItem('role', role);

                    if (result.constituency) {
                        localStorage.setItem('constituency', result.constituency);
                    } else {
                        localStorage.removeItem('constituency');
                    }
                    if (result.designation) {
                        localStorage.setItem('designation', result.designation);
                    } else {
                        localStorage.removeItem('designation');
                    }

                    ui.success("Login Successful!");
                    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);

                } else {
                    ui.error("Login failed. Please check your credentials.");
                    loginBtn.disabled = false;
                }

            } catch (error) {
                console.error("Login error:", error);
                ui.error("An error occurred during login. Please try again.");
                loginBtn.disabled = false;
            } finally {
                ui.hideLoader();
            }
        });
    }
});
