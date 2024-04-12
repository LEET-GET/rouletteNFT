// Helper function to handle API requests
function apiRequest(url, method, data) {
    return fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    });
}

// Handle registration
document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    apiRequest('http://209.38.248.1:8001/user/register/', 'POST', { email: email, password: password })
        .then(data => {
            console.log('Registration Success:', data);
            alert('Registration successful!');
            // Optionally redirect the user or clear the form
            document.getElementById('registrationForm').reset();
        })
        .catch(error => {
            console.error('Registration Error:', error);
            alert('Registration failed!');
        });
});

// Handle login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    apiRequest('http://209.38.248.1:8001/user/login/', 'POST', { username: username, password: password })
        .then(data => {
            console.log('Login Success:', data);
            alert('Login successful!');
            // Store token in localStorage or handle as needed
            localStorage.setItem('accessToken', data.access);
            // Fetch user profile or redirect as needed
            window.location.href = 'https://roulettenft.onrender.com/profile.html'; // Change this URL to your user's profile page or main page
        })
        .catch(error => {
            console.error('Login Error:', error);
            alert('Login failed!');
        });
});