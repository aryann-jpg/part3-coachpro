async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.classList.add('hidden');

    // Basic input validation
    if (!username || !password) {
        showErrorMessage('Please enter both username and password.');
        return;
    }

    try {
        // Use full backend URL if specified
        const response = await fetch(`http://localhost:30080/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Login Successful. Token received:', data.token);
            
            // Save session data
            sessionStorage.setItem('authToken', data.token);
            sessionStorage.setItem('coachId', data.coachId);

            showSuccessMessage();

            // Redirect after 1 second
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1000);

        } else if (response.status === 401) {
            showErrorMessage('Invalid username or password. Please check your credentials.');

        } else if (response.status === 400) {
            const errorData = await response.json().catch(() => ({}));
            showErrorMessage(errorData.message || 'Bad request. Please check your input.');

        } else if (response.status === 500) {
            showErrorMessage('A server error occurred. Please try again later.');

        } else {
            const errorData = await response.json().catch(() => ({ message: 'Login failed due to unknown error.' }));
            showErrorMessage(errorData.message || 'Login failed.');
        }

    } catch (error) {
        console.error('Network or Fetch Error:', error);
        showErrorMessage('Cannot connect to the server. Please check your network or backend server.');
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
