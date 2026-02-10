async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.classList.add('hidden');

    try {
        // --------------------------------------------
        // AUTO-LOGIN FOR DEVELOPMENT (skip token)
        // --------------------------------------------
        console.log('Auto-login successful for user:', username);

        // Save coachId locally (optional)
        sessionStorage.setItem('coachId', username); // Using username as mock coachId

        showSuccessMessage();
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1000);

        // --------------------------------------------
        // The real fetch call is commented out for testing
        // --------------------------------------------
        /*
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) { // Status 200 OK
            const data = await response.json();
            console.log('Login Successful. Token received:', data.token);
            sessionStorage.setItem('authToken', data.token);
            sessionStorage.setItem('coachId', data.coachId);
            showSuccessMessage();
            setTimeout(() => {
                 window.location.href = '/index.html';
            }, 1000);
        } else if (response.status === 401) {
            showErrorMessage('Invalid username or password.');
        } else {
            const errorData = await response.json().catch(() => ({ message: 'Login failed.' }));
            showErrorMessage(errorData.message || 'Login failed.');
        }
        */

    } catch (error) {
        console.error('Unexpected Error:', error);
        showErrorMessage('Cannot process login.');
    }
}

function showSuccessMessage() {
    const form = document.getElementById('loginForm');
    form.innerHTML = `
<div class="text-center p-6 bg-secondary/10 text-secondary border border-secondary rounded-lg">
<svg class="w-8 h-8 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>
<p class="font-bold">Access Granted!</p>
<p class="text-sm">Authenticating and Redirecting...</p>
</div>
    `;
}

function showErrorMessage(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}
