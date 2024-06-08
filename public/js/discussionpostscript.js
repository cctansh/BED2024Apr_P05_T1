function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

async function fetchPost(postId) {
    const response = await fetch(`/posts/${postId}`);
    const post = await response.json();

    const postContainer = document.getElementById('post-container');

    if (post) {
        const postHtml = `
            <div class="post">
                <div class="postheader">
                    <div class="account">${await fetchAccountName(post.accId)}</div>
                    <div class="datetime">${new Date(post.postDateTime).toLocaleDateString('en-CA')} ${new Date(post.postDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div class="text">${post.postText}</div>
            </div>
        `;
        postContainer.innerHTML = postHtml;
    } else {
        postContainer.textContent = 'Post not found';
    }
}

async function fetchReplies(postId) {
    const response = await fetch(`/replies/by-post/${postId}`);
    const data = await response.json();

    const replyContainer = document.getElementById('reply-container');

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
        headerElement.classList.add("postheader");


        // ... add more elements for other book data (optional)

        headerElement.appendChild(accountElement);
        headerElement.appendChild(dateTimeElement);

        replyItem.appendChild(headerElement);
        replyItem.appendChild(textElement);
        // ... append other elements

        replyContainer.appendChild(replyItem);
    };
}

async function fetchAccountName(accId) {
    const response = await fetch(`/accounts/${accId}`);
    const account = await response.json();
    return account.accName;
}

const postId = getUrlParams();

fetchPost(postId);
fetchReplies(postId);