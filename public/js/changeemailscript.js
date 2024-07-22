// token
const token = sessionStorage.getItem('token');
const loginProfileLink = document.getElementById('login-profile-link');
const loginAccId = sessionStorage.getItem('loginAccId');
const loginAccRole = sessionStorage.getItem('loginAccRole');
const rToken = getCookie('rToken');

if (token && !isTokenExpired(token)) {
    loginProfileLink.innerHTML = `Profile`;
    loginProfileLink.setAttribute("href", `profile.html?id=${loginAccId}`)
} else if (rToken) {
    refreshToken(rToken);
} else {
    sessionStorage.clear()
    window.location.href = `/index.html`;
}

function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

const accId = getUrlParams();

document.getElementById('change-email-form').addEventListener('submit', async function (e) {
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

function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the token payload
    const expiry = payload.exp * 1000; // Convert expiry time to milliseconds
    return Date.now() > expiry; // Check if the current time is past the expiry time
}

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

  function deleteCookie(cname) {
    document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }

  async function refreshToken(rToken) {
    try {
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

        const token = result.token;
        const decodedToken = parseJwt(token);
        const loginAccId = decodedToken.accId;
        const loginAccRole = decodedToken.accRole;

        sessionStorage.setItem('token', token);
        sessionStorage.setItem('loginAccId', loginAccId);
        sessionStorage.setItem('loginAccRole', loginAccRole);
        
        location.reload();
    } catch {
        console.log("error")
        alert('Login timed out.');
        sessionStorage.clear();
        deleteCookie('rToken');   
        window.location.href = `/index.html`;
    }
}