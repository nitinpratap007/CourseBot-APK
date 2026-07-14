// Shared API helper functions
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001/api'
    : (window.COURSEBOT_API_URL || '/api');

function getAuthHeaders(headers = {}) {
    const token = localStorage.getItem('adminToken');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

async function apiGet(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: getAuthHeaders()
        });
        if (response.status === 401 || response.status === 403) {
            if(window.location.pathname.includes('admin.html')) {
                window.location.href = 'admin-login.html';
            }
            throw new Error('Unauthorized');
        }
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('API GET Error:', error);
        throw error;
    }
}

async function apiPost(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(data)
        });
        if (response.status === 401 || response.status === 403) {
            if(window.location.pathname.includes('admin.html')) {
                window.location.href = 'admin-login.html';
            }
            throw new Error('Unauthorized');
        }
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('API POST Error:', error);
        throw error;
    }
}

async function apiDelete(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (response.status === 401 || response.status === 403) {
            if(window.location.pathname.includes('admin.html')) {
                window.location.href = 'admin-login.html';
            }
            throw new Error('Unauthorized');
        }
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('API DELETE Error:', error);
        throw error;
    }
}
