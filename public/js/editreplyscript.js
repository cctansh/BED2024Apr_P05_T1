// token
const token = localStorage.getItem('token');
const loginProfileLink = document.getElementById('login-profile-link');
const loginAccId = localStorage.getItem('loginAccId');
const loginAccRole = localStorage.getItem('loginAccRole');

if (token) {
    loginProfileLink.innerHTML = `Profile&ensp;<i class="bi bi-person-fill"></i>`;
    loginProfileLink.setAttribute("href", `profile.html?id=${loginAccId}`)
} else {
    loginProfileLink.innerHTML = `Login&ensp;<i class="bi bi-person-fill"></i>`;
    loginProfileLink.setAttribute("href", 'loginreg.html')
}

function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
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
                alert("An error occurred while adding your reply. Please try again later.");
            }
        }
    });
}

const replyId = getUrlParams();
console.log(replyId)

fetchPost(replyId);
fetchReply(replyId);