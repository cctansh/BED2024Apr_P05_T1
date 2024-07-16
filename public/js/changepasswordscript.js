// token
const token = sessionStorage.getItem('token');
const loginProfileLink = document.getElementById('login-profile-link');
const loginAccId = sessionStorage.getItem('loginAccId');
const loginAccRole = sessionStorage.getItem('loginAccRole');

if (token && !isTokenExpired(token)) {
    loginProfileLink.innerHTML = `Profile&ensp;<i class="bi bi-person-fill"></i>`;
    loginProfileLink.setAttribute("href", `profile.html?id=${loginAccId}`)
} else {
    // If token is not present or is expired (user not logged in)
    // Clear the session storage if the token is expired
    if (token && isTokenExpired(token)) {
        sessionStorage.clear();
        location.reload();
    }

    loginProfileLink.innerHTML = `Login&ensp;<i class="bi bi-person-fill"></i>`;
    loginProfileLink.setAttribute("href", 'loginreg.html')
}

function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

const accId = getUrlParams();

document.getElementById('change-password').addEventListener('submit', async function (e) {
    e.preventDefault();
    const changePasswordData = {
        accPassword: document.getElementById('newPassword').value
    };
    const oldPassword = document.getElementById('oldPassword').value;
    const confirmPassword = document.getElementById('newPasswordConfirm').value;

    const errorField = document.getElementById('changePasswordError');
    errorField.textContent = ''; // Clear previous error messages

    //old password match
    const oldPasswordMatch = await fetch(`/accounts/check`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: accId, password: oldPassword})
    });

    if (!changePasswordData.accPassword || !oldPassword || !confirmPassword) {
        errorField.textContent = 'Change password failed: All fields must be filled.';
        return;
    } else if (!oldPasswordMatch) {
        errorField.textContent = 'Change password failed: Old password does not match';
        return;
    } else if (changePasswordData.accPassword !== confirmPassword) {
        errorField.textContent = 'Change password failed: New passwords do not match';
        return;
    }

    try {
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

        window.location.href = `profile.html?id=${accId}`;
    } catch (err) {
        // Display error messages
        errorField.textContent = 'Change password failed: ' + err.message;
    }
});

const cancelButton = document.getElementById('cancel-button');
cancelButton.addEventListener('click', () => {
    window.location.href = `/profile.html?id=${accId}`;
});

function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the token payload
    const expiry = payload.exp * 1000; // Convert expiry time to milliseconds
    return Date.now() > expiry; // Check if the current time is past the expiry time
}