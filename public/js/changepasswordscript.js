// token
const token = localStorage.getItem('token');
const loginProfileLink = document.getElementById('login-profile-link');
const loginAccId = localStorage.getItem('loginAccId');
const loginAccRole = localStorage.getItem('loginAccRole');

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

document.getElementById('change-password').addEventListener('submit', async function (e) {
    e.preventDefault();
    const changePasswordData = {
        accPassword: document.getElementById('newPassword').value
    };
    const oldPassword = document.getElementById('oldPassword').value;
    const confirmPassword = document.getElementById('newPasswordConfirm').value;

    const errorField = document.getElementById('changePasswordError');
    errorField.textContent = ''; // Clear previous error messages

    //check old password matches
    const oldPasswordConfirm = await fetchOldPassword(accId);

    //testing
    console.log(oldPassword);
    console.log(oldPasswordConfirm);
    console.log(changePasswordData.accPassword);
    console.log(confirmPassword);


    if (!changePasswordData.accPassword || !oldPassword || !confirmPassword) {
        errorField.textContent = 'Change password failed: All fields must be filled.';
        return;
    } else if (oldPassword != oldPasswordConfirm) {
        errorField.textContent = 'Change password failed: Old password does not match';
        return;
    } else if (changePasswordData.accPassword != confirmPassword) {
        errorField.textContent = 'Change password failed: New passwords do not match';
        return;
    }

    try {
        const response = await fetch(`/accounts/${accId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
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

async function fetchOldPassword(accId) {
    const response = await fetch(`/accounts/${accId}`);
    const account = await response.json();
    return account.accPassword;
}