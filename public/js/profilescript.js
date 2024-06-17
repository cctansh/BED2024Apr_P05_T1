const token = localStorage.getItem('token');
const loginAccId = localStorage.getItem('loginAccId');

function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

const logoutButton = document.getElementById('logout');
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loginAccId');
    window.location.href = 'loginreg.html'; // Redirect to login page after logout
});

async function fetchPostsAndReplies(profileId) {
    const response = await fetch(`/accounts/postreply/${profileId}`);
    const postreply = await response.json();

    
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

    postItem.onclick = () => {
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
    textElement.textContent = obj.text;

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

    replyItem.onclick = () => {
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
}

async function fetchAccountName(accId) {
    const response = await fetch(`/accounts/${accId}`);
    const account = await response.json();
    return account.accName;
}

// function to fetch reply count for a post
async function fetchReplyCount(postId) {
    const response = await fetch(`/posts/${postId}/replyCount`);
    const replyCount = await response.json();
    return replyCount.replyCount;
}

async function fetchRepliedPost(replyId) {
    const response = await fetch(`/replies/post/${replyId}`);
    const post = await response.json();
    
    const container = document.getElementById("postreply");

    const postItem = document.createElement("div");
    postItem.classList.add('post-addreply');

    postItem.onclick = () => {
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
    textElement.textContent = post.postText;

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
}

const profileId = getUrlParams();

fetchPostsAndReplies(profileId);