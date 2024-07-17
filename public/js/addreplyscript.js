// Retrieve the token from session storage
const token = sessionStorage.getItem('token');
const loginProfileLink = document.getElementById('login-profile-link');
const loginAccId = sessionStorage.getItem('loginAccId');
const loginAccRole = sessionStorage.getItem('loginAccRole');

// Get the original post ID from the URL parameters
const postId = getUrlParams();

if (token && !isTokenExpired(token)) {
    // If the token is valid, update the login profile link to the user's profile
    loginProfileLink.innerHTML = `Profile&ensp;<i class="bi bi-person-fill"></i>`;
    loginProfileLink.setAttribute("href", `profile.html?id=${loginAccId}`);
} else {
    // If the token is not present or has expired (user not logged in)
    if (token && isTokenExpired(token)) {
        // Clear session storage if the token is expired and alert the user
        sessionStorage.clear();
        alert('Login timed out.');
        window.location.href = `/discussionpost.html?id=${postId}`;
    }

    // Update the login profile link to the login/registration page
    loginProfileLink.innerHTML = `Login&ensp;<i class="bi bi-person-fill"></i>`;
    loginProfileLink.setAttribute("href", 'loginreg.html');
}

// Function to get URL parameters
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Function to fetch the post details using the post ID
async function fetchPost(postId) {
    const response = await fetch(`/posts/${postId}`);
    const post = await response.json();

    const postContainer = document.getElementById('post-container');
    const postTitle = document.getElementById('post-title');

    if (post) {
        // Populate the post title and text
        postTitle.textContent = `${post.postTitle}`;
        postContainer.innerHTML = `
            <div class="post-addreply">
                <div class="text">${post.postText}</div>
            </div>
        `;
    } else {
        // Display message if the post is not found
        postContainer.textContent = 'Post not found';
    }
}

// Fetch the post details upon page load
fetchPost(postId);

// Event listener for the "Cancel Reply" button
const cancelReply = document.getElementById("cancel-reply");
cancelReply.onclick = () => {
    window.location.href = `/discussionpost.html?id=${postId}`;
};

// Event listener for the "Confirm Reply" button
const confirmReply = document.getElementById("confirm-reply");
const newReplyTextarea = document.getElementById("newreply");

confirmReply.addEventListener('click', async () => {
    const confirmed = confirm("Are you sure you want to add this reply?");
    if (confirmed) {
        const replyText = newReplyTextarea.value.trim();

        if (!replyText) {
            // Alert if the reply text is empty
            alert("Reply cannot be empty.");
            return;
        } else if (replyText.length > 5000) {
            // Alert if the reply text exceeds the character limit
            alert("Reply should be within 5000 characters.");
            return;
        }

        const newReplyData = {
            replyText: replyText,
            accId: loginAccId,
            replyTo: postId
        };

        try {
            // Send a POST request to add the new reply
            const response = await fetch('/replies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newReplyData)
            });

            if (response.ok) {
                // Redirect to the discussion post if the reply is added successfully
                window.location.href = `/discussionpost.html?id=${postId}`;
            } else {
                // Display an error message if the response is not ok
                const errorData = await response.json();
                alert(`Error: ${errorData.message}\nDetails: ${errorData.errors.join(', ')}`);
            }
        } catch (error) {
            // Log and alert in case of any other errors
            console.error("Error adding reply:", error);
            alert("An error occurred while adding your reply. Please try again later.");
        }
    }
});

// Function to check if the token is expired
function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the token payload
    const expiry = payload.exp * 1000; // Convert expiry time to milliseconds
    return Date.now() > expiry; // Check if the current time is past the expiry time
}