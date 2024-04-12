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
        window.location.href = 'http://127.0.0.1:5500/VGO-master/public/profile.html';
        fetchUserProfile(); 
    })
    .catch((error) => {
        console.error('Login Error:', error);

    });
});
document.addEventListener('DOMContentLoaded', function() {
    // Fetch profile on initial load and set up refresh every 6 seconds
    fetchUserProfile();
    setInterval(fetchUserProfile, 6000);
});





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
document.addEventListener('DOMContentLoaded', function() {
    // Fetch profile on initial load and set up a periodic update
    fetchUserProfile();
    setInterval(fetchUserProfile, 5000); // Update profile every 5 seconds
});

function fetchUserProfile() {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        console.log('No access token found, skipping profile fetch.');
        updateUIForLoggedOutUser();
        return;
    }

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
    .then(updateProfileUI)
    .catch(error => {
        console.error('Profile Fetch Error:', error);
        updateUIForLoggedOutUser();
    });
}

function updateProfileUI(data) {
    const userEmailSpan = document.getElementById('userEmail');
    const userNameSpan = document.getElementById('userName');
    const userDateJoinedSpan = document.getElementById('userDateJoined');
    const userFirstNameSpan = document.getElementById('userFirstName');
    const userLastNameSpan = document.getElementById('userLastName');
    const userBalanceSpan = document.getElementById('balanceAmount');

    if (userEmailSpan) userEmailSpan.textContent = data.email || 'No email available';
    if (userNameSpan) userNameSpan.textContent = data.username || 'No username available';
    if (userDateJoinedSpan) userDateJoinedSpan.textContent = data.date_joined || 'No date joined available';
    if (userFirstNameSpan) userFirstNameSpan.textContent = data.first_name || 'No first name available';
    if (userLastNameSpan) userLastNameSpan.textContent = data.last_name || 'No last name available';
    if (userBalanceSpan) userBalanceSpan.textContent = data.bill ? `${data.bill.amount}$` : '0$';
}

function updateUIForLoggedOutUser() {
    const userElements = [document.getElementById('userEmail'), document.getElementById('userName'), document.getElementById('userDateJoined'), document.getElementById('userFirstName'), document.getElementById('userLastName'), document.getElementById('balanceAmount')];
    userElements.forEach(elem => {
        if (elem) elem.textContent = '';
    });

    const signInButton = document.getElementById('sign-button-container');
    const profileButton = document.getElementById('profile-button-container');
    const userBalanceDiv = document.getElementById('userBalance');

    if (signInButton) signInButton.style.display = 'block';
    if (profileButton) profileButton.style.display = 'none';
    if (userBalanceDiv) userBalanceDiv.style.display = 'none'; // Hide balance if user is not logged in
}



function addAmount(value) {
    const input = document.getElementById('amountInput');
    let currentValue = parseFloat(input.value.replace('$', ''));
    currentValue += value;
    input.value = currentValue.toFixed(2) + "$";
}

function sendTransaction() {
    const accessToken = localStorage.getItem('accessToken');
    const amount = parseFloat(document.getElementById('amountInput').value.replace('$', ''));
    fetch('http://209.38.248.1:8001/payments/transaction/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            amount: amount.toString(),
            currency: "USD"
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Transaction successful:', data);
        alert('Transaction submitted successfully! Redirecting...');
        // Check if the response includes a message starting with "http"
        if (data.message && data.message.startsWith("http")) {
            window.location.href = data.message; // Redirect to the URL provided in the response
        } else {
            console.log('No valid URL received.');
        }
    })
    .catch((error) => {
        console.error('Transaction failed:', error);
        alert('Error submitting transaction.');
    });
}