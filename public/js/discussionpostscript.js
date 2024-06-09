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
        postHeader.innerHTML = `
            <div class="account">${await fetchAccountName(post.accId)}</div>
            <div class="datetime">${new Date(post.postDateTime).toLocaleDateString('en-CA')} ${new Date(post.postDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
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

    for (const reply of data) {
        const replyItem = document.createElement("div");
        replyItem.classList.add("reply"); // Add a CSS class for styling

        // Create elements for title, account, etc. and populate with book data
        const accountElement = document.createElement("div");
        accountElement.classList.add("account");
        accountElement.textContent = await fetchAccountName(reply.accId);

        const dateTimeElement = document.createElement("div");
        dateTimeElement.classList.add("datetime");
        // Format the date and time
        const replyDate = new Date(reply.replyDateTime);
        const formattedDate = replyDate.toLocaleDateString('en-CA'); // Format date as YYYY-MM-DD
        const formattedTime = replyDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); // Format time as HH:MM

        dateTimeElement.textContent = `${formattedDate}, ${formattedTime}`;

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
        replyItem.innerHTML += `
            <div class="edit-bar">
                <button class="btn edit-reply"><i class="bi bi-pencil-fill"></i></button>
                <button class="btn delete-reply"><i class="bi bi-trash3-fill"></i></button>
            </div>
        `

        replyContainer.appendChild(replyItem);

        const deleteButton = replyItem.querySelector('.delete-reply');
        deleteButton.addEventListener('click', async () => {
            const confirmed = confirm("Are you sure you want to delete this reply?");
            if (confirmed) {
                await deleteReply(reply.replyId);

                fetchReplies(postId); // Refresh the replies after deletion
            }
        });
    };
}

async function fetchAccountName(accId) {
    const response = await fetch(`/accounts/${accId}`);
    const account = await response.json();
    return account.accName;
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