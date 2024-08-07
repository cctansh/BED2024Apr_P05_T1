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
    // If no valid tokens, clear session and redirect to discussion forum
    sessionStorage.clear();
    window.location.href = `/discussionforum.html`;
}

// Function to fetch and display the original post
async function fetchPost(replyId) {
    const response = await fetch(`/replies/post/${replyId}`);
    const post = await response.json();

    const postContainer = document.getElementById('post-container');
    const postTitle = document.getElementById('post-title');

    if (post) {
        postTitle.textContent = `${post.postTitle}`;
        postContainer.innerHTML = `
            <div class="post-addreply">
                <div class="text">${post.postText}</div>
            </div>
        `;
    } else {
        postContainer.textContent = 'Post not found';
    }
}

// Function to fetch and display the reply for editing
async function fetchReply(replyId) {
    const response = await fetch(`/replies/${replyId}`);
    const reply = await response.json();

    const newReplyTextarea = document.getElementById("newreply");

    // Set textarea value to the reply text
    newReplyTextarea.value = reply.replyText;

    // Set up cancel reply button
    const cancelReply = document.getElementById("cancel-reply");
    cancelReply.onclick = () => {
        window.location.href = `/discussionpost.html?id=${reply.replyTo}`;
    };

    // Set up confirm edit button
    const confirmReply = document.getElementById("confirm-reply");

    confirmReply.addEventListener('click', async () => {
        const confirmed = confirm("Save changes?");
        if (confirmed) {
            const replyText = newReplyTextarea.value.trim();

            // Validate reply text
            if (!replyText) {
                alert("Reply cannot be empty.");
                return;
            } else if (replyText.length > 5000) {
                alert("Reply should be within 5000 characters.");
                return;
            }

            const newReplyData = {
                replyText: replyText
            };

            try {
                // Send PUT request to update the reply
                const response = await fetch(`/replies/${reply.replyId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(newReplyData)
                });

                if (response.ok) {
                    window.location.href = `/discussionpost.html?id=${reply.replyTo}`;
                } else {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.message}\nDetails: ${errorData.errors.join(', ')}`);
                }
            } catch (error) {
                console.error("Error adding reply:", error);
                alert("An error occurred while editing your reply. Please try again later.");
            }
        }
    });
}

// Function to get URL parameters
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Get reply ID from URL parameters
const replyId = getUrlParams();
console.log(replyId);

// Fetch and display the post and reply
fetchPost(replyId);
fetchReply(replyId);

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
        // Clear session and cookies, redirect to discussion forum
        sessionStorage.clear();
        deleteCookie('rToken');   
        window.location.href = `/discussionforum.html`;
    }
}
