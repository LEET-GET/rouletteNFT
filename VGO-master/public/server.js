// Prevent form submission default action and handle registration
document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    fetch('http://209.38.248.1:8001/user/register/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, password: password })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Registration Success:', data);
    })
    .catch((error) => {
        console.error('Registration Error:', error);
    });
});

// Prevent form submission default action and handle login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    fetch('http://209.38.248.1:8001/user/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(response => {
        if (!response.ok) throw new Error('Login failed');
        return response.json();
    })
    .then(data => {
        localStorage.setItem('accessToken', data.access);
        console.log('Login successful, fetching profile...');
        fetchUserProfile(); // Fetch user profile immediately after successful login
        window.location.href = 'https://roulettenft.onrender.com/profile.html';
        fetchUserProfile(); 
    })
    .catch((error) => {
        console.error('Login Error:', error);
        
    });
});
fetchUserProfile(); 





document.addEventListener('DOMContentLoaded', function() {
    const accessToken = localStorage.getItem('accessToken');
    updateNavBasedOnAuth(accessToken);
});

function updateNavBasedOnAuth(accessToken) {
    const signInButton = document.getElementById('sign-button-container');
    const profileButton = document.getElementById('profile-button-container');
    const userBalance = document.getElementById('userBalance');

    if (accessToken) {
        fetchUserProfile(); // Fetch and display user balance
        signInButton.style.display = 'none';
        profileButton.style.display = 'block';
    } else {
        signInButton.style.display = 'block';
        profileButton.style.display = 'none';
        if (userBalance) userBalance.style.display = 'none';
    }
}


function fetchUserProfile() {
    const accessToken = localStorage.getItem('accessToken');
    fetch('http://209.38.248.1:8001/user/profile/', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to fetch profile');
        return response.json();
    })
    .then(data => {
        document.getElementById('userEmail').textContent = data.email;
        document.getElementById('userName').textContent = data.username;
        document.getElementById('userDateJoined').textContent = data.date_joined;
        document.getElementById('userFirstName').textContent = data.first_name;
        document.getElementById('userLastName').textContent = data.last_name;
        document.getElementById('userBalance').textContent = data.bill.amount;
    })
    .then(data => {
        const userBalance = document.getElementById('userBalance');
        if (userBalance) {
            userBalance.style.display = 'block';
            userBalance.textContent = `Balance: ${data.bill.amount}`;
        }
    })
    .catch((error) => {
        console.error('Profile Fetch Error:', error);
    });
}

