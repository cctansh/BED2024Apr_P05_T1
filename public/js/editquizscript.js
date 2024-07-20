// Retrieve necessary elements
const token = sessionStorage.getItem('token'); // Retrieve token from local storage
const loginProfileLink = document.getElementById('login-profile-link'); // Retrieve profile link element
const loginAccId = sessionStorage.getItem('loginAccId'); // Retrieve logged-in account ID from local storage
const loginAccRole = sessionStorage.getItem('loginAccRole'); // Retrieve logged-in account role from local storage

if (token && !isTokenExpired(token)) {
  // If token is present (user is logged in)
  // Show logged in display ("Profile" and person icon) and set href to redirect to the user's account page
  loginProfileLink.innerHTML = `Profile&ensp;<i class="bi bi-person-fill"></i>`;
  loginProfileLink.setAttribute("href", `profile.html?id=${loginAccId}`)
} else {
  // If token is not present or is expired (user not logged in)
  // Clear the session storage if the token is expired
  // Show default display ("Login" and person icon) and set href to redirect to user register page
  if (token && isTokenExpired(token)) {
      sessionStorage.clear();
      alert('Login timed out.');
      window.location.href = `/index.html`;
  }

  loginProfileLink.innerHTML = `Login&ensp;<i class="bi bi-person-fill"></i>`;
  loginProfileLink.setAttribute("href", 'loginreg.html')
}