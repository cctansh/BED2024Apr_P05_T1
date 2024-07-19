document.addEventListener('DOMContentLoaded', function () {
    const token = sessionStorage.getItem('token');
    const loginAccId = sessionStorage.getItem('loginAccId');
    const rToken = getCookie('rToken');

    if (token && !isTokenExpired(token)) {
        window.location.href = `profile.html?id=${loginAccId}`;
        console.log("Logged in")
    } else if (rToken) {
        refreshToken(rToken);
    } else if (token && isTokenExpired(token)){
        sessionStorage.clear();
        deleteCookie('rToken');
        location.reload();
    }

    document.getElementById('login').addEventListener('submit', async function (e) {
        e.preventDefault();
        const loginData = {
            accEmail: document.getElementById('loginEmail').value,
            accPassword: document.getElementById('loginPassword').value
        };
        try {
            const response = await fetch('/accounts/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });
            if (!response.ok) {
                throw new Error(await response.text());
            }

            const result = await response.json();
            alert('Login successful');

            const token = result.token;
            const decodedToken = parseJwt(token);
            const loginAccId = decodedToken.accId;
            const loginAccRole = decodedToken.accRole;

            const refreshToken = result.refreshToken;

            sessionStorage.setItem('token', token);
            sessionStorage.setItem('loginAccId', loginAccId);
            sessionStorage.setItem('loginAccRole', loginAccRole);
            setCookie('rToken', refreshToken, 7);

            window.location.href = 'index.html';
        } catch (err) {
            // Display error messages
            const errorField = document.getElementById('loginError');
            errorField.textContent = ''; // Clear previous error messages

            errorField.textContent = 'Login failed: Invalid e-mail or password';
        }
    });

    document.getElementById('register').addEventListener('submit', async function (e) {
        e.preventDefault();
        const registerData = {
            accName: document.getElementById('registerName').value,
            accEmail: document.getElementById('registerEmail').value,
            accPassword: document.getElementById('registerPassword').value,
            accRole: 'member'
        };
        const confirmPassword = document.getElementById('registerPasswordConfirm').value;

        const errorField = document.getElementById('registerError');
        errorField.textContent = ''; // Clear previous error messages

        if (registerData.accPassword !== confirmPassword) {
            errorField.textContent = 'Registration failed: Passwords do not match';
            return;
        }

        try {
            const response = await fetch('/accounts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registerData)
            });
            if (!response.ok) {
                throw new Error(await response.text());
            }

            const result = await response.json();
            alert('Registration successful. Returning to login page.');

            window.location.href = 'loginreg.html';
        } catch (err) {
            // Display error messages
            errorField.textContent = 'Registration failed: ' + err.message;
        }
    });
});

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

function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the token payload
    const expiry = payload.exp * 1000; // Convert expiry time to milliseconds
    return Date.now() > expiry; // Check if the current time is past the expiry time
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
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
        sessionStorage.clear();
        deleteCookie('rToken');   
        location.reload(); 
    }
}