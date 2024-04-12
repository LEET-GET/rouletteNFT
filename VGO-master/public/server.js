



function checkLoginStatusAndUpdateUI() {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        fetchUserProfile();
        setInterval(fetchUserProfile, 6000); // Update profile every 6 seconds
    }
    updateNavBasedOnAuth(); // This ensures UI is updated irrespective of the login status
}

function fetchUserProfile() {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        console.log('No access token found, skipping profile fetch.');
        return;
    }

    fetch('https://0c4e-5-34-4-112.ngrok-free.app/user/profile/', {
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
        updateProfileUI(data);
        updateNavBasedOnAuth(); // Update navigation status based on successful profile fetch
    })
    .catch(error => {
        console.error('Profile Fetch Error:', error);
    });
}

function updateProfileUI(data) {
    const userEmailSpan = document.getElementById('userEmail');
    const userBalanceSpan = document.getElementById('balanceAmount');
    const userNameSpan = document.getElementById('userName');
    const userDateJoinedSpan = document.getElementById('userDateJoined');
    const userFirstNameSpan = document.getElementById('userFirstName');
    const userLastNameSpan = document.getElementById('userLastName');

    if (userEmailSpan) userEmailSpan.textContent = data.email || 'No email available';
    if (userNameSpan) userNameSpan.textContent = data.username || 'No username available';
    if (userDateJoinedSpan) userDateJoinedSpan.textContent = data.date_joined || 'No date joined available';
    if (userFirstNameSpan) userFirstNameSpan.textContent = data.first_name || 'No first name available';
    if (userLastNameSpan) userLastNameSpan.textContent = data.last_name || 'No last name available';
    if (userBalanceSpan) userBalanceSpan.textContent = data.bill ? `${data.bill.amount}$` : '0$';
}


function updateNavBasedOnAuth() {
    const accessToken = localStorage.getItem('accessToken');
    const signInButton = document.getElementById('sign-button-container');
    const profileButton = document.getElementById('profile-button-container');

    if (accessToken) {
        signInButton.style.display = 'none';
        profileButton.style.display = 'block';
    } else {
        signInButton.style.display = 'block';
        profileButton.style.display = 'none';
    }
}

// Registration Form
document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    fetch('https://0c4e-5-34-4-112.ngrok-free.app/user/register/', {
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

// Login Form
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    fetch('https://0c4e-5-34-4-112.ngrok-free.app/user/login/', {
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
        window.location.href = 'http://127.0.0.1:5500/VGO-master/public/profile.html'; // Redirect to profile page
    })
    .catch((error) => {
        console.error('Login Error:', error);
    });
});




function deductOneDollar() {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        alert('You are not logged in.');
        return;
    }

    // Fetch the current user profile to get the latest balance
    fetch('https://0c4e-5-34-4-112.ngrok-free.app/user/profile/', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to fetch user profile');
        return response.json();
    })
    .then(data => {
        if (!data.bill || data.bill.amount === undefined) {
            throw new Error("Balance information is missing");
        }
        // Calculate new balance by deducting $1
        const newBalance = parseFloat(data.bill.amount) - 1;
        // Send the updated balance to the server
        return fetch('https://0c4e-5-34-4-112.ngrok-free.app/payments/bill/update/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ amount: newBalance.toString() })
        });
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to update bill');
        return response.json();
    })
    .then(updatedData => {
        console.log('Bill updated successfully:', updatedData);
        fetchUserProfile();  // Refresh user profile to update the balance display
    })
    .catch(error => {
        console.error('Failed to deduct money:', error);
        alert('Failed to deduct money: ' + error.message);
    });
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
    fetch('https://0c4e-5-34-4-112.ngrok-free.app/payments/transaction/', {
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
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatusAndUpdateUI();
});

document.getElementById('startButton').addEventListener('click', function() {
    deductOneDollar();
});