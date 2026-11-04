document.addEventListener('DOMContentLoaded', () => {

    const signupForm = document.getElementById('signupForm');
    const signupBtn = document.getElementById('signupBtn');
    const roleSelect = document.getElementById('role');
    const representativeFields = document.getElementById('representativeFields');

    if (roleSelect && representativeFields) {
        roleSelect.addEventListener('change', () => {
            representativeFields.style.display = roleSelect.value === 'REPRESENTATIVE' ? 'block' : 'none';
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const role = document.getElementById('role').value;
            const password = document.getElementById('password').value.trim();
            const constituency = document.getElementById('constituency')?.value.trim();
            const designation = document.getElementById('designation')?.value.trim();

            const preferredLanguage = localStorage.getItem('preferred_language') || document.getElementById('appLangSelect')?.value || 'EN';

            if (!username || !fullName || !email || !phone || !role || !password) {
                ui.error("Please fill out all fields completely.");
                return;
            }

            if (role === 'REPRESENTATIVE' && !constituency) {
                ui.error("Please enter the representative constituency or area.");
                return;
            }

            ui.showLoader("Creating account...");
            signupBtn.disabled = true;

            const requestBody = {
                username,
                password,
                email,
                role,
                fullName,
                phone,
                preferredLanguage
            };

            if (role === 'REPRESENTATIVE') {
                requestBody.constituency = constituency;
                requestBody.designation = designation;
            }

            if (preferredLanguage) {
                localStorage.setItem('preferred_language', preferredLanguage);
                if (window.i18n) window.i18n.setLanguage(preferredLanguage);
            }

            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                });

                if (response.ok || response.status === 201) {
                    ui.success("Registration Successful!");
                    const alertElem = document.getElementById('verifyNotificationAlert');
                    if (alertElem) alertElem.style.display = 'block';
                    setTimeout(() => window.location.href = 'login.html', 3500);
                } else {
                    const errText = await response.text();
                    ui.error(`Registration failed: ${errText || 'Unknown error'}`);
                    signupBtn.disabled = false;
                }

            } catch (error) {
                console.error("Signup error:", error);
                ui.error("An error occurred during sign up. Please try again.");
                signupBtn.disabled = false;
            } finally {
                ui.hideLoader();
            }
        });
    }
});
