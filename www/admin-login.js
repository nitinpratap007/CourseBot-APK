document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    if (localStorage.getItem('adminToken')) {
        window.location.href = 'admin.html';
    }

    const loginForm = document.getElementById('login-form');
    const errorDiv = document.getElementById('login-error');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (response.ok) {
                // Save token
                localStorage.setItem('adminToken', data.token);
                window.location.href = 'admin.html';
            } else {
                errorDiv.textContent = data.error || 'Login failed.';
                errorDiv.style.display = 'block';
            }
        } catch (err) {
            errorDiv.textContent = 'Server connection error.';
            errorDiv.style.display = 'block';
        }
    });
});
