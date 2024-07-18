// token
const token = sessionStorage.getItem('token');
const loginProfileLink = document.getElementById('login-profile-link');
const loginAccId = sessionStorage.getItem('loginAccId');
const loginAccRole = sessionStorage.getItem('loginAccRole');

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
        window.location.href = `/discussionforum.html`;
    }

    loginProfileLink.innerHTML = `Login&ensp;<i class="bi bi-person-fill"></i>`;
    loginProfileLink.setAttribute("href", 'loginreg.html')
}

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

async function fetchReply(replyId) {
    const response = await fetch(`/replies/${replyId}`);
    const reply = await response.json();

    const newReplyTextarea = document.getElementById("newreply");

    // set text area as reply text
    newReplyTextarea.value = reply.replyText;

    // cancel reply
    const cancelReply = document.getElementById("cancel-reply");
    cancelReply.onclick = () => {
        window.location.href = `/discussionpost.html?id=${reply.replyTo}`;
    };

    //confirm edit
    const confirmReply = document.getElementById("confirm-reply");

    confirmReply.addEventListener('click', async () => {
        const confirmed = confirm("Save changes?");
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
                replyText: replyText
            };

            try {
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

function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

const replyId = getUrlParams();
console.log(replyId)

fetchPost(replyId);
fetchReply(replyId);

function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the token payload
    const expiry = payload.exp * 1000; // Convert expiry time to milliseconds
    return Date.now() > expiry; // Check if the current time is past the expiry time
}