// token
const token = sessionStorage.getItem('token');
const loginProfileLink = document.getElementById('login-profile-link');
const loginAccId = sessionStorage.getItem('loginAccId');
const loginAccRole = sessionStorage.getItem('loginAccRole');

if (token) {
    loginProfileLink.innerHTML = `Profile&ensp;<i class="bi bi-person-fill"></i>`;
    loginProfileLink.setAttribute("href", `profile.html?id=${loginAccId}`)
} else {
    loginProfileLink.innerHTML = `Login&ensp;<i class="bi bi-person-fill"></i>`;
    loginProfileLink.setAttribute("href", 'loginreg.html')
}

function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

const accId = getUrlParams();

document.getElementById('change-email').addEventListener('submit', async function (e) {
    e.preventDefault();
    const changeEmailData = {
        accEmail: document.getElementById('newEmail').value
    };
    const confirmEmail = document.getElementById('newEmailConfirm').value;

    const errorField = document.getElementById('changeEmailError');
    errorField.textContent = ''; // Clear previous error messages

    if (!changeEmailData.accEmail || !confirmEmail) {
        errorField.textContent = 'Change email failed: All fields must be filled.';
        return;
    } else if (changeEmailData.accEmail !== confirmEmail) {
        errorField.textContent = 'Change email failed: New emails do not match';
        return;
    }

    try {
        const response = await fetch(`/accounts/${accId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(changeEmailData)
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const result = await response.json();
        alert('Change email successful. Returning to profile page.');

        window.location.href = `profile.html?id=${accId}`;
    } catch (err) {
        // Display error messages
        errorField.textContent = 'Change email failed: ' + err.message;
    }
});

const cancelButton = document.getElementById('cancel-button');
cancelButton.addEventListener('click', () => {
    window.location.href = `/profile.html?id=${accId}`;
});