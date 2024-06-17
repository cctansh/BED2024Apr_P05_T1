document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const loginAccId = localStorage.getItem('loginAccId');

    if (token) {
        window.location.href = `profile.html?id=${loginAccId}`;
        console.log("Logged in")
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

            localStorage.setItem('token', token);
            localStorage.setItem('loginAccId', loginAccId);
            console.log(token);
            console.log(loginAccId);

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
            accPassword: document.getElementById('registerPassword').value
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