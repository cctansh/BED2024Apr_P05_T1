const token = localStorage.getItem('token');
const loginAccId = localStorage.getItem('loginAccId');

const logoutButton = document.getElementById('logout');
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loginAccId');
    window.location.href = 'loginreg.html'; // Redirect to login page after logout
});