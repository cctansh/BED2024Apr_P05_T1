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
                    <div class="author">${post.postAuthor}</div>
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

    const postContainer = document.getElementById('post-container');

    data.forEach((reply) => {
        const replyItem = document.createElement("div");
        replyItem.classList.add("reply"); // Add a CSS class for styling

        // Create elements for title, author, etc. and populate with book data
        const authorElement = document.createElement("div");
        authorElement.classList.add("author");
        authorElement.textContent = reply.replyAuthor;

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

        // header to hold author and datetime
        const headerElement = document.createElement("div");
        headerElement.classList.add("postheader");


        // ... add more elements for other book data (optional)

        headerElement.appendChild(authorElement);
        headerElement.appendChild(dateTimeElement);

        replyItem.appendChild(headerElement);
        replyItem.appendChild(textElement);
        // ... append other elements

        postContainer.appendChild(replyItem);
    });
}

const postId = getUrlParams();

fetchPost(postId);
fetchReplies(postId);