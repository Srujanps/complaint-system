document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    const loadingState = document.getElementById("loadingState");
    const successState = document.getElementById("successState");
    const errorState = document.getElementById("errorState");
    const successMsg = document.getElementById("successMsg");
    const errorMsg = document.getElementById("errorMsg");

    if (!token) {
        loadingState.style.display = "none";
        errorState.style.display = "block";
        errorMsg.textContent = "No verification token provided in URL.";
        return;
    }

    try {
        const baseUrl = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : (window.location.protocol.startsWith('http') ? window.location.origin + '/api' : 'http://localhost:8080/api');
        const response = await fetch(`${baseUrl}/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await response.json();

        loadingState.style.display = "none";
        if (response.ok && data.verified) {
            successState.style.display = "block";
            if (data.message) successMsg.textContent = data.message;
        } else {
            errorState.style.display = "block";
            errorMsg.textContent = data.message || "Failed to verify email address.";
        }
    } catch (err) {
        loadingState.style.display = "none";
        errorState.style.display = "block";
        errorMsg.textContent = "Unable to connect to server. Please check backend service.";
    }
});
