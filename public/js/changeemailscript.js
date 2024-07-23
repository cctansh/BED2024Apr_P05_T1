// Retrieve token from session storage
const token = sessionStorage.getItem('token');

// Get the login profile link element by its ID
const loginProfileLink = document.getElementById('login-profile-link');

// Retrieve login account ID and role from session storage
const loginAccId = sessionStorage.getItem('loginAccId');
const loginAccRole = sessionStorage.getItem('loginAccRole');

// Get the refresh token from cookies
const rToken = getCookie('rToken');

// Check if the token exists and is not expired
if (token && !isTokenExpired(token)) {
    // If the token is valid, set the profile link
    loginProfileLink.innerHTML = `Profile`;
    loginProfileLink.setAttribute("href", `profile.html?id=${loginAccId}`);
} else if (rToken) {
    // If the token is expired but a refresh token exists, refresh the token
    refreshToken(rToken);
} else {
    // If no valid token or refresh token exists, clear session storage and redirect to the index page
    sessionStorage.clear();
    window.location.href = `/index.html`;
}

// Function to get URL parameters
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Get the account ID from URL parameters
const accId = getUrlParams();

// Add an event listener for the form submission to change email
document.getElementById('change-email-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    
    // Get the new email and confirmation email values
    const changeEmailData = {
        accEmail: document.getElementById('newEmail').value
    };
    const confirmEmail = document.getElementById('newEmailConfirm').value;

    // Get the error field element
    const errorField = document.getElementById('changeEmailError');
    errorField.textContent = ''; // Clear previous error messages

    // Validate the email fields
    if (!changeEmailData.accEmail || !confirmEmail) {
        errorField.textContent = 'Change email failed: All fields must be filled.';
        return;
    } else if (changeEmailData.accEmail !== confirmEmail) {
        errorField.textContent = 'Change email failed: New emails do not match';
        return;
    }

    try {
        // Send a PUT request to update the email
        const response = await fetch(`/accounts/${accId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(changeEmailData)
        });

        // Check if the response is not OK
        if (!response.ok) {
            throw new Error(await response.text());
        }

        // Parse the response
        const result = await response.json();
        alert('Change email successful. Returning to profile page.');

        // Redirect to the profile page
        window.location.href = `profile.html?id=${accId}`;
    } catch (err) {
        // Display error messages
        errorField.textContent = 'Change email failed: ' + err.message;
    }
});

// Add an event listener for the cancel button to redirect to the profile page
const cancelButton = document.getElementById('cancel-button');
cancelButton.addEventListener('click', () => {
    window.location.href = `/profile.html?id=${accId}`;
});

// Function to check if the token is expired
function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the token payload
    const expiry = payload.exp * 1000; // Convert expiry time to milliseconds
    return Date.now() > expiry; // Check if the current time is past the expiry time
}

// Function to parse a JWT token
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing JWT token:', error);
        return null;
    }
}

// Function to get a cookie by name
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// Function to delete a cookie by name
function deleteCookie(cname) {
    document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// Function to refresh the token using the refresh token
async function refreshToken(rToken) {
    try {
        const response = await fetch('/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${rToken}`
            }
        });

        // Check if the response is not OK
        if (!response.ok) {
            throw new Error(await response.text());
        }

        // Parse the response
        const result = await response.json();

        // Extract the new token and decode it
        const token = result.token;
        const decodedToken = parseJwt(token);
        const loginAccId = decodedToken.accId;
        const loginAccRole = decodedToken.accRole;

        // Store the new token and account details in session storage
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('loginAccId', loginAccId);
        sessionStorage.setItem('loginAccRole', loginAccRole);
        
        // Reload the page
        location.reload();
    } catch {
        console.log("error");
        alert('Login timed out.');
        sessionStorage.clear();
        deleteCookie('rToken');   
        window.location.href = `/index.html`;
    }
}
