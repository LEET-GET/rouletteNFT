document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkLoginStatusAndUpdateUI();
});

function setupEventListeners() {
    const registrationForm = document.getElementById('registrationForm');
    const loginForm = document.getElementById('loginForm');
    const startButton = document.getElementById('startButton');
    const sellItemButton = document.getElementById('SellItem');

    if (registrationForm) registrationForm.addEventListener('submit', handleRegistration);
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (startButton) startButton.addEventListener('click', deductOneDollar);
    if (sellItemButton) sellItemButton.addEventListener('click', sellSelectedItem);
}

function handleRegistration(e) {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    registerUser(email, password);
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    loginUser(username, password);
}


function registerUser(email, password) {
    fetch('https://moneymaker-back.org/user/register/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email: email, password: password})
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "отправлено") {
            alert("Registration successful! Please check your email to confirm your account.");
            console.log('Registration Success:', data);
        } else if (data.email && data.email.length > 0) {
            alert(`Error: ${data.email[0]}`); 
            console.error('Registration Error:', data);
        } else {
            alert("An error occurred during registration. Please try again.");
            console.error('Registration Error:', data);
        }
    })
    .catch(error => {
        console.error('Registration Error:', error);
        alert("Registration failed due to a network or server error.");
    });
}


function loginUser(username, password) {
    fetch('https://moneymaker-back.org/user/login/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username: username, password: password})
    })
    .then(response => {
        if (!response.ok) throw new Error('Login failed');
        return response.json();
    })
    .then(data => {
        localStorage.setItem('accessToken', data.access);
        window.location.href = 'https://roulettenft.onrender.com/profile.html'; // redirect to profile.html
    })
    .catch(error => console.error('Login Error:', error));
}

function checkLoginStatusAndUpdateUI() {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        fetchUserProfile();
        setInterval(fetchUserProfile, 6000);
    }
    updateNavBasedOnAuth();
}

function handleFetchResponse(response) {
    if (!response.ok) {
        // Try to parse the response as JSON, then check for specific error message
        response.json().then(data => {
            if (data.detail === "Given token not valid for any token type") {
                // Log out the user or redirect to login page
                window.location.href = 'auth1.html';
            }
        }).catch(err => {
            console.error('Error parsing response:', err);
        });
        throw new Error('Network response was not ok.');
    }
    return response.json();  // continue to process valid responses
}

function fetchUserProfile() {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        console.log('No access token found, skipping profile fetch.');
        return;
    }

    fetch('https://moneymaker-back.org/user/profile/', {
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
        updateNavBasedOnAuth();
    })
    .catch(error => console.error('Profile Fetch Error:', error));
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

function getNumericBalance() {
    const balanceSpan = document.getElementById('balanceAmount');
    // Get the text content of the span and remove the dollar sign and any other non-numeric characters except the decimal point
    const balanceText = balanceSpan.textContent.replace(/[^\d.-]/g, '');
    return parseFloat(balanceText);
}

function deductOneDollar() {
    const balanceAmount = getNumericBalance();
    const accessToken = localStorage.getItem('accessToken');
    console.log(balanceAmount);
    if (balanceAmount < 1) {
        console.log('Insufficient balance to start the roulette.');
        return;
    }
    if (!accessToken) {
        alert('You are not logged in.');
        return;
    }

    fetch('https://moneymaker-back.org/user/profile/', {
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
        // Calculate new balance by deducting $1 and format to two decimal places
        const newBalance = parseFloat(data.bill.amount) - 1;
        const formattedBalance = parseFloat(newBalance.toFixed(2)); // Format and parse to float

        // Send the updated balance to the server
        return fetch('https://moneymaker-back.org/payments/bill/update/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ amount: formattedBalance.toString() }) // Send as string
        });
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to update bill');
        return response.json();
    })
    .then(updatedData => {
        console.log('Bill updated successfully:', updatedData);
        fetchUserProfile(); // Refresh user profile
    })
    .catch(error => {
        console.error('Failed to deduct money:', error);
        alert('Failed to deduct money: ' + error.message);
    });
}


function sellSelectedItem() {
    const selectedItemName = displayCenterItemName(); 
    const rewardValue = rewards[selectedItemName]; 
    
    if (rewardValue === undefined) {
        console.error('Selected item does not have a defined reward.');
        alert('Error: Selected item does not have a defined reward.');
        return;
    }
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        alert('You are not logged in.');
        return;
    }

    fetch('https://moneymaker-back.org/user/profile/', {
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
        const newBalance = parseFloat(data.bill.amount) + rewardValue;
        // Using toFixed(2) to format to two decimal places and parsing it to float to ensure correct data type if needed
        return fetch('https://moneymaker-back.org/payments/bill/update/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ amount: parseFloat(newBalance.toFixed(2)).toString() }) // Ensuring no trailing zeros
        });
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to update bill');
        return response.json();
    })
    .then(updatedData => {
        console.log('Bill updated successfully:', updatedData);
        closeModal3();
        fetchUserProfile();  // Refresh user profile
    })
    .catch(error => {
        console.error('Failed to sell item:', error);
        alert('Failed to sell item: ' + error.message);
    });
}


function closeModal3() {
    const closeModalButton = document.getElementById('closeModal');
    if (closeModalButton) {
        closeModalButton.click();
    }
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
    fetch('https://moneymaker-back.org/payments/transaction/', {
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
    .then(handleFetchResponse)
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
