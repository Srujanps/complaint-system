const API_BASE_URL = (typeof window !== 'undefined' && window.API_BASE_URL)
    ? window.API_BASE_URL
    : (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')
        ? (window.location.port === '8080' ? 'http://localhost:8080/api' : `${window.location.origin}/api`)
        : 'http://localhost:8080/api');

const fromId = (id) => document.getElementById(id);

async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        if (response.status === 401 || response.status === 403) {
            ui.error("Session expired or unauthorized. Please login.");
            localStorage.removeItem('token');
            // Use absolute path so nested pages redirect correctly
            setTimeout(() => window.location.href = '/login.html', 1500);
            return null;
        }
        
        return response;
    } catch (error) {
        console.error("API Fetch Error:", error);
        ui.error("Network error. Please try again.");
        return null;
    }
}

const API = {
    get: async (endpoint) => {
        const res = await apiFetch(endpoint, { method: 'GET' });
        if (!res) return null;
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `GET ${endpoint} failed (${res.status})`);
        }
        const text = await res.text();
        return text ? JSON.parse(text) : null;
    },
    post: async (endpoint, body) => {
        const res = await apiFetch(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : null
        });
        if (!res) return null;
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `POST ${endpoint} failed (${res.status})`);
        }
        const text = await res.text();
        return text ? JSON.parse(text) : null;
    },
    put: async (endpoint, body) => {
        const res = await apiFetch(endpoint, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : null
        });
        if (!res) return null;
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `PUT ${endpoint} failed (${res.status})`);
        }
        const text = await res.text();
        return text ? JSON.parse(text) : null;
    },
    delete: async (endpoint) => {
        const res = await apiFetch(endpoint, { method: 'DELETE' });
        if (!res) return null;
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `DELETE ${endpoint} failed (${res.status})`);
        }
        const text = await res.text();
        return text ? JSON.parse(text) : null;
    }
};
