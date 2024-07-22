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
    loginProfileLink.innerHTML = `Login`;
    loginProfileLink.setAttribute("href", 'loginreg.html')
}

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
        location.reload();
    }
}