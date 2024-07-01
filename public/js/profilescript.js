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
    loginProfileLink.classList.remove('active');
}

function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

async function fetchPostsAndReplies(profileId) {
    const response = await fetch(`/accounts/postreply/${profileId}`);
    const postreply = await response.json();

    if (postreply == 0) {
        const container = document.getElementById("postreply");
        container.innerHTML = "This user has not made any posts or replies.";
        return;
    }

    for (const obj of postreply) {
        if (obj.type == 'Post') {
            await fetchPost(obj);
        } else {
            await fetchRepliedPost(obj.id);
            await fetchReply(obj);
        }
    };
}

async function fetchPost(obj) {
    const container = document.getElementById("postreply");

    const postItem = document.createElement("div");
    postItem.classList.add('post');

    postItem.onclick = (e) => {
        e.stopPropagation();
        window.location.href = `/discussionpost.html?id=${obj.id}`;
    };

    // Create elements for title, account, etc. and populate with book data
    const accountElement = document.createElement("div");
    accountElement.classList.add("account");
    accountElement.textContent = await fetchAccountName(obj.accId);

    // fetch reply count
    const replyCount = await fetchReplyCount(obj.id);

    const dateTimeElement = document.createElement("div");
    dateTimeElement.classList.add("datetime");
    // Format the date and time
    const postDate = new Date(obj.dateTime);
    const year = postDate.getUTCFullYear();
    const month = String(postDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(postDate.getUTCDate()).padStart(2, '0');
    const hours = String(postDate.getUTCHours()).padStart(2, '0');
    const minutes = String(postDate.getUTCMinutes()).padStart(2, '0');
    const formattedDate = `${day}/${month}/${year}`;
    const formattedTime = `${hours}:${minutes}`;

    // display reply count and datetime
    dateTimeElement.innerHTML = `<i class="bi bi-chat-dots-fill"></i>  ${replyCount} | ${formattedDate}, ${formattedTime}`;

    const textElement = document.createElement("div");
    textElement.classList.add("text");
    textElement.classList.add("title");
    textElement.textContent = obj.title;

    // header to hold account and datetime
    const headerElement = document.createElement("div");
    headerElement.classList.add("boxheader");

    headerElement.appendChild(accountElement);
    headerElement.appendChild(dateTimeElement);

    postItem.appendChild(headerElement);
    postItem.appendChild(textElement);

    if (token && loginAccId && loginAccId == obj.accId) {
        postItem.innerHTML += `
        <div class="edit-bar">
            <button class="btn edit-reply"><i class="bi bi-pencil-fill"></i></button>
            <button class="btn delete-reply"><i class="bi bi-trash3-fill"></i></button>
        </div>
        `
    }

    container.appendChild(postItem);

    const accountButton = postItem.querySelector('.account');
    accountButton.addEventListener('click', (e) => {
        e.stopPropagation();
        window.location.href = `/profile.html?id=${obj.accId}`;
    });
}

async function fetchReply(obj) {
    const container = document.getElementById("postreply");

    const replyBox = document.createElement("div");
    replyBox.classList.add("reply-box");

    const connector = document.createElement("div");
    connector.classList.add("connector");
    connector.innerHTML = `
        <img src="../img/connect.png"></img>
    `

    const replyItem = document.createElement("div");
    replyItem.classList.add("reply");

    replyItem.onclick = (e) => {
        e.stopPropagation();
        window.location.href = `/discussionpost.html?id=${obj.replyto}`;
    };

    // Create elements for title, account, etc. and populate with book data
    const accountElement = document.createElement("div");
    accountElement.classList.add("account");
    accountElement.textContent = await fetchAccountName(obj.accId);

    const dateTimeElement = document.createElement("div");
    dateTimeElement.classList.add("datetime");
    // Format the date and time
    const replyDate = new Date(obj.dateTime);
    const year = replyDate.getUTCFullYear();
    const month = String(replyDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(replyDate.getUTCDate()).padStart(2, '0');
    const hours = String(replyDate.getUTCHours()).padStart(2, '0');
    const minutes = String(replyDate.getUTCMinutes()).padStart(2, '0');
    const formattedDate = `${day}/${month}/${year}`;
    const formattedTime = `${hours}:${minutes}`;

    // display reply count and datetime
    dateTimeElement.innerHTML = `${formattedDate}, ${formattedTime}`;

    const textElement = document.createElement("div");
    textElement.classList.add("text");
    textElement.textContent = obj.text;

    // header to hold account and datetime
    const headerElement = document.createElement("div");
    headerElement.classList.add("boxheader");

    headerElement.appendChild(accountElement);
    headerElement.appendChild(dateTimeElement);

    replyItem.appendChild(headerElement);
    replyItem.appendChild(textElement);

    if (token && loginAccId && loginAccId == obj.accId) {
        replyItem.innerHTML += `
        <div class="edit-bar">
            <button class="btn edit-reply"><i class="bi bi-pencil-fill"></i></button>
            <button class="btn delete-reply"><i class="bi bi-trash3-fill"></i></button>
        </div>
        `
    }

    replyBox.appendChild(connector);
    replyBox.appendChild(replyItem);

    container.appendChild(replyBox);

    const accountButton = replyItem.querySelector('.account');
    accountButton.addEventListener('click', (e) => {
        e.stopPropagation();
        window.location.href = `/profile.html?id=${obj.accId}`;
    });

    if (token && loginAccId && loginAccId == obj.accId) {
        const deleteReplyButton = replyItem.querySelector('.delete-reply');
        deleteReplyButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            const confirmed = confirm("Are you sure you want to delete this reply?");
            if (confirmed) {
                try {
                    await deleteReply(obj.id);
                    window.location.href = `/profile.html?id=${obj.accId}`;
                } catch (error) {
                    console.error("Failed to delete reply:", error);
                    alert('Failed to delete reply.');
                }
            }
        });

        const editReply = replyItem.querySelector('.edit-reply');
        editReply.addEventListener('click', async (e) => {
            e.stopPropagation();
            window.location.href = `/editreply.html?id=${obj.id}`;
        });
    }
}

async function fetchAccountName(accId) {
    const response = await fetch(`/accounts/${accId}`);
    const account = await response.json();
    return account.accName;
}

async function fetchAccountRole(accId) {
    const response = await fetch(`/accounts/${accId}`);
    const account = await response.json();
    return account.accRole;
}

// function to fetch reply count for a post
async function fetchReplyCount(postId) {
    const response = await fetch(`/posts/${postId}/replyCount`);
    const replyCount = await response.json();
    return replyCount.replyCount;
}

async function deleteReply(replyId) {
    const response = await fetch(`/replies/${replyId}`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        alert('Failed to delete reply.');
    }
}

async function fetchRepliedPost(replyId) {
    const response = await fetch(`/replies/post/${replyId}`);
    const post = await response.json();

    const container = document.getElementById("postreply");

    const postItem = document.createElement("div");
    postItem.classList.add('post-addreply');

    postItem.onclick = (e) => {
        e.stopPropagation();
        window.location.href = `/discussionpost.html?id=${post.postId}`;
    };

    // Create elements for title, account, etc. and populate with book data
    const accountElement = document.createElement("div");
    accountElement.classList.add("account");
    accountElement.textContent = await fetchAccountName(post.accId);

    // fetch reply count
    const replyCount = await fetchReplyCount(post.postId);

    const dateTimeElement = document.createElement("div");
    dateTimeElement.classList.add("datetime");
    // Format the date and time
    const postDate = new Date(post.postDateTime);
    const year = postDate.getUTCFullYear();
    const month = String(postDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(postDate.getUTCDate()).padStart(2, '0');
    const hours = String(postDate.getUTCHours()).padStart(2, '0');
    const minutes = String(postDate.getUTCMinutes()).padStart(2, '0');
    const formattedDate = `${day}/${month}/${year}`;
    const formattedTime = `${hours}:${minutes}`;

    // display reply count and datetime
    dateTimeElement.innerHTML = `<i class="bi bi-chat-dots-fill"></i>  ${replyCount} | ${formattedDate}, ${formattedTime}`;

    const textElement = document.createElement("div");
    textElement.classList.add("text");
    textElement.classList.add("title");
    textElement.textContent = post.postTitle;

    // header to hold account and datetime
    const headerElement = document.createElement("div");
    headerElement.classList.add("boxheader");

    headerElement.appendChild(accountElement);
    headerElement.appendChild(dateTimeElement);

    postItem.appendChild(headerElement);
    postItem.appendChild(textElement);

    if (token && loginAccId && loginAccId == post.accId) {
        postItem.innerHTML += `
        <div class="edit-bar">
            <button class="btn edit-reply"><i class="bi bi-pencil-fill"></i></button>
            <button class="btn delete-reply"><i class="bi bi-trash3-fill"></i></button>
        </div>
        `
    }

    container.appendChild(postItem);

    const accountButton = postItem.querySelector('.account');
    accountButton.addEventListener('click', (e) => {
        e.stopPropagation();
        window.location.href = `/profile.html?id=${post.accId}`;
    });
}

async function setProfileName(profileId) {
    const profileName = await fetchAccountName(profileId);
    document.getElementById("profile-name").textContent = `${profileName}'s Profile`;
}

async function setAdminIndicator(profileId) {
    const adminIndicator = document.getElementById('admin');
    const profileRole = await fetchAccountRole(profileId);
    if (profileRole == 'admin') {
        adminIndicator.classList.remove('hide');
    }
}

async function setAccountDetails(profileId) {
    const response = await fetch(`/accounts/${profileId}`);
    const account = await response.json();
    document.getElementById('email-info').textContent = `E-mail: ${account.accEmail}`;
}

async function deleteAccount(profileId) {
    try {
        fetch('/accounts/' + profileId, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        alert('Account deleted. Returning to login page.');
        window.location.href = 'loginreg.html';
    } catch (err) {
        console.log('Deleteion failed: ' + err.message);
    }
}

const profileId = getUrlParams();

setProfileName(profileId);
setAdminIndicator(profileId);

const logoutButton = document.getElementById('logout');
logoutButton.addEventListener('click', () => {
    const confirmed = confirm("Are you sure you want to log out?");
    if (confirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('loginAccId');
        localStorage.removeItem('loginAccRole');
        window.location.href = 'loginreg.html'; // Redirect to login page after logout
    }
});

const deleteAccButton = document.getElementById('delete-acc');
deleteAccButton.addEventListener('click', async () => {
    const confirmed = confirm("Are you sure you want to delete your account?");
    if (confirmed) {
        await deleteAccount(profileId);
        localStorage.removeItem('token');
        localStorage.removeItem('loginAccId');
        localStorage.removeItem('loginAccRole');

        window.location.href = 'loginreg.html'; // Redirect to login page after logout
    }
});

const changePasswordButton = document.getElementById('change-password');
changePasswordButton.addEventListener('click', () => {
    window.location.href = `/changepassword.html?id=${profileId}`;
});


if (loginAccId != profileId) {
    document.getElementById("profile").classList.add('hide');
} else {
    setAccountDetails(profileId);
}

// if (loginAccRole == "admin")

fetchPostsAndReplies(profileId);