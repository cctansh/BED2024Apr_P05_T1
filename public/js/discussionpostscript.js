// token
const token = localStorage.getItem('token');
const loginProfileLink = document.getElementById('login-profile-link');

if (token) {
    loginProfileLink.innerHTML = `Profile&ensp;<i class="bi bi-person-fill"></i>`;
} else {
    loginProfileLink.innerHTML = `Login&ensp;<i class="bi bi-person-fill"></i>`;
}

const loginAccId = localStorage.getItem('loginAccId');

function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

async function fetchPost(postId) {
    const response = await fetch(`/posts/${postId}`);
    const post = await response.json();

    const postHeader = document.getElementById('post-header');
    const postContainer = document.getElementById('post-container');

    if (post) {
        //formatting date
        const postDate = new Date(post.postDateTime);

        postHeader.innerHTML = `
            <div class="account">${await fetchAccountName(post.accId)}</div>
            <div class="datetime">${formatDate(postDate)}</div>
        `
        postContainer.innerHTML = `
            <div class="post">
                <div class="text">${post.postText}</div>
                <div class="edit-bar">
                    <button class="btn edit-post"><i class="bi bi-pencil-fill"></i></button>
                    <button class="btn delete-reply"><i class="bi bi-trash3-fill"></i></button>
                </div>
            </div>
        `;
    } else {
        postContainer.textContent = 'Post not found';
    }
}

async function fetchReplies(postId) {
    const response = await fetch(`/replies/by-post/${postId}`);
    const data = await response.json();

    const replyContainer = document.getElementById('reply-container');
    replyContainer.innerHTML = "";

    if (data.length === 0) {
        replyContainer.innerHTML = "Leave a reply!";
        return;
    }

    for (const reply of data) {
        const replyItem = document.createElement("div");
        replyItem.classList.add("reply"); // Add a CSS class for styling

        // Create elements for title, account, etc. and populate with book data
        const accountElement = document.createElement("div");
        accountElement.classList.add("account");
        accountElement.textContent = await fetchAccountName(reply.accId);

        const dateTimeElement = document.createElement("div");
        dateTimeElement.classList.add("datetime");
        // Format the date and time\
        const replyDate = new Date(reply.replyDateTime);

        if (reply.replyEdited == 0) {
            dateTimeElement.textContent = formatDate(replyDate);
        } else {
            dateTimeElement.textContent = `Edited at ${formatDate(replyDate)}`;
        }

        const textElement = document.createElement("div");
        textElement.classList.add("text");
        textElement.textContent = reply.replyText;

        // header to hold account and datetime
        const headerElement = document.createElement("div");
        headerElement.classList.add("boxheader");

        headerElement.appendChild(accountElement);
        headerElement.appendChild(dateTimeElement);

        replyItem.appendChild(headerElement);
        replyItem.appendChild(textElement);

        if (token && loginAccId && loginAccId == reply.accId) {
            replyItem.innerHTML += `
            <div class="edit-bar">
                <button class="btn edit-reply"><i class="bi bi-pencil-fill"></i></button>
                <button class="btn delete-reply"><i class="bi bi-trash3-fill"></i></button>
            </div>
            `
        }

        replyContainer.appendChild(replyItem);

        if (loginAccId && loginAccId == reply.accId) {
            const deleteReplyButton = replyItem.querySelector('.delete-reply');
            deleteReplyButton.addEventListener('click', async () => {
                const confirmed = confirm("Are you sure you want to delete this reply?");
                if (confirmed) {
                    try {
                        await deleteReply(reply.replyId);
                        fetchReplies(postId); // Refresh the replies after deletion
                    } catch (error) {
                        console.error("Failed to delete reply:", error);
                        alert('Failed to delete reply.');
                    }
                }
            });

            const editReply = replyItem.querySelector('.edit-reply');
            editReply.addEventListener('click', async () => {
                window.location.href = `/editreply.html?id=${reply.replyId}`;
            });
        }
    };
}

async function fetchAccountName(accId) {
    const response = await fetch(`/accounts/${accId}`);
    const account = await response.json();
    return account.accName;
}

function formatDate(ogDate) {
    const year = ogDate.getUTCFullYear();
    const month = String(ogDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(ogDate.getUTCDate()).padStart(2, '0');
    const hours = String(ogDate.getUTCHours()).padStart(2, '0');
    const minutes = String(ogDate.getUTCMinutes()).padStart(2, '0');
    const formattedDate = `${day}/${month}/${year}`;
    const formattedTime = `${hours}:${minutes}`;
    return `${formattedDate}, ${formattedTime}`;
}

async function deleteReply(replyId) {
    const response = await fetch(`/replies/${replyId}`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        alert('Failed to delete reply.');
    }
}

const postId = getUrlParams();

fetchPost(postId);
fetchReplies(postId);

const addReply = document.getElementById("add-reply");
addReply.onclick = () => {
    if (token) {
        window.location.href = `/addreply.html?id=${postId}`;
    } else {
        alert("You must be logged in to add a reply.")
    }

};