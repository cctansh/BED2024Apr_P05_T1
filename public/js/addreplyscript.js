// token
const token = sessionStorage.getItem('token');
const loginProfileLink = document.getElementById('login-profile-link');
const loginAccId = sessionStorage.getItem('loginAccId');
const loginAccRole = sessionStorage.getItem('loginAccRole');

if (token && !isTokenExpired(token)) {
    loginProfileLink.innerHTML = `Profile&ensp;<i class="bi bi-person-fill"></i>`;
    loginProfileLink.setAttribute("href", `profile.html?id=${loginAccId}`)
} else {
    // If token is not present or is expired (user not logged in)
    // Clear the session storage if the token is expired
    if (token && isTokenExpired(token)) {
        sessionStorage.clear();
        location.reload();
    }

    loginProfileLink.innerHTML = `Login&ensp;<i class="bi bi-person-fill"></i>`;
    loginProfileLink.setAttribute("href", 'loginreg.html')
}

function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

async function fetchPost(postId) {
    const response = await fetch(`/posts/${postId}`);
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

const postId = getUrlParams();
console.log(postId)

fetchPost(postId);

// cancel reply
const cancelReply = document.getElementById("cancel-reply");
cancelReply.onclick = () => {
    window.location.href = `/discussionpost.html?id=${postId}`;
};

// confirm reply
const confirmReply = document.getElementById("confirm-reply");
const newReplyTextarea = document.getElementById("newreply");

const accId = parseInt(sessionStorage.getItem('loginAccId'));

confirmReply.addEventListener('click', async () => {
    const confirmed = confirm("Are you sure you want to add this reply?");
    if (confirmed) {
        const replyText = newReplyTextarea.value.trim();
    
        if (!replyText) {
            alert("Reply cannot be empty.");
            return;
        } else if (replyText.length > 5000) {
            alert("Reply should be within 5000 characters.");
            return;
        }

        const newReplyData = {
            replyText: replyText,
            accId: accId,
            replyTo: postId
        };

        try {
            const response = await fetch('/replies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newReplyData)
            });

            if (response.ok) {
                window.location.href = `/discussionpost.html?id=${postId}`;
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}\nDetails: ${errorData.errors.join(', ')}`);
            }
        } catch (error) {
            console.error("Error adding reply:", error);
            alert("An error occurred while adding your reply. Please try again later.");
        }
    }
});

function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the token payload
    const expiry = payload.exp * 1000; // Convert expiry time to milliseconds
    return Date.now() > expiry; // Check if the current time is past the expiry time
}