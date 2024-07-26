// Retrieve authentication token and user information from session storage
const token = sessionStorage.getItem('token');
const loginProfileLink = document.getElementById('login-profile-link');
const loginAccId = sessionStorage.getItem('loginAccId');
const loginAccRole = sessionStorage.getItem('loginAccRole');
const rToken = getCookie('rToken');

// Check token validity and handle accordingly
if (token && !isTokenExpired(token)) {
    // If token is valid, update profile link
    loginProfileLink.innerHTML = `Profile`;
    loginProfileLink.setAttribute("href", `profile.html?id=${loginAccId}`);
} else if (rToken) {
    // If token is expired but refresh token exists, attempt to refresh
    refreshToken(rToken);
} else {
    // If no valid tokens, clear session and redirect to login
    sessionStorage.clear();
    window.location.href = `/index.html`;
}

// Function to get URL parameters
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Get account ID from URL parameters
const accId = getUrlParams();

// Add event listener for password change form submission
document.getElementById('change-password-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    // Get new password data
    const changePasswordData = {
        accPassword: document.getElementById('newPassword').value
    };
    const oldPassword = document.getElementById('oldPassword').value;
    const confirmPassword = document.getElementById('newPasswordConfirm').value;

    // Get error field element
    const errorField = document.getElementById('changePasswordError');
    errorField.textContent = ''; // Clear previous error messages


    // Check if old password matches
    const oldPasswordMatch = await fetch(`/accounts/check`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: accId, password: oldPassword})
    });

    const oldPasswordResult = await oldPasswordMatch.json();

    // Validate input fields
    if (!changePasswordData.accPassword || !oldPassword || !confirmPassword) {
        errorField.textContent = 'Change password failed: All fields must be filled.';
        return;
    } else if (!oldPasswordResult.check) {
        errorField.textContent = 'Change password failed: Old password does not match';
        return;
    } else if (changePasswordData.accPassword !== confirmPassword) {
        errorField.textContent = 'Change password failed: New passwords do not match';
        return;
    }

    try {
        // Send PUT request to update password
        const response = await fetch(`/accounts/${accId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(changePasswordData)
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const result = await response.json();
        alert('Change password successful. Returning to profile page.');

        // Redirect to profile page
        window.location.href = `profile.html?id=${accId}`;
    } catch (err) {
        // Display error messages
        errorField.textContent = 'Change password failed: ' + err.message;
    }
});

// Add event listener for cancel button
const cancelButton = document.getElementById('cancel-button');
cancelButton.addEventListener('click', () => {
    window.location.href = `/profile.html?id=${accId}`;
});

// Function to check if token is expired
function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the token payload
    const expiry = payload.exp * 1000; // Convert expiry time to milliseconds
    return Date.now() > expiry; // Check if the current time is past the expiry time
}

// Function to parse JWT token
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
    for(let i = 0; i <ca.length; i++) {
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

// Function to delete a cookie
function deleteCookie(cname) {
    document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// Function to refresh the authentication token
async function refreshToken(rToken) {
    try {
        // Send POST request to refresh token
        const response = await fetch('/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${rToken}`
            }
        });
        if (!response.ok) {
            throw new Error(await response.text());
        }

        const result = await response.json();

        // Parse new token and update session storage
        const token = result.token;
        const decodedToken = parseJwt(token);
        const loginAccId = decodedToken.accId;
        const loginAccRole = decodedToken.accRole;

        sessionStorage.setItem('token', token);
        sessionStorage.setItem('loginAccId', loginAccId);
        sessionStorage.setItem('loginAccRole', loginAccRole);
        
        // Reload the page
        location.reload();
    } catch {
        console.log("error");
        alert('Login timed out.');
        // Clear session and cookies, redirect to login
        sessionStorage.clear();
        deleteCookie('rToken');   
        window.location.href = `/index.html`;
    }
}
