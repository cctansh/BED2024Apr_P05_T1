// Token
const token = localStorage.getItem('token'); // Retrieve token from local storage
const loginProfileLink = document.getElementById('login-profile-link'); // Retrieve profile link element
const loginAccId = localStorage.getItem('loginAccId'); // Retrieve logged-in account ID from local storage
const loginAccRole = localStorage.getItem('loginAccRole'); // Retrieve logged-in account role from local storage

if (token) {
    // If token is present (user is logged in)
    // Show logged in display ("Profile" and person icon) and set href to redirect to the user's account page
    loginProfileLink.innerHTML = `Profile&ensp;<i class="bi bi-person-fill"></i>`;
    loginProfileLink.setAttribute("href", `profile.html?id=${loginAccId}`)
} else {
    // If token is not present (user not logged in)
    // Show default display ("Login" and person icon) and set href to redirect to user register page
    loginProfileLink.innerHTML = `Login&ensp;<i class="bi bi-person-fill"></i>`;
    loginProfileLink.setAttribute("href", 'loginreg.html')
}

// Function to get "id" parameter from the URL query string
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Async function to fetch and display a single post by postId
async function fetchPost(postId) {
    const response = await fetch(`/posts/${postId}`); // Fetch post data from API endpoint
    const post = await response.json(); // Convert response to JSON format

    // Get elements from HTML
    const postHeader = document.getElementById('post-header');
    const postContainer = document.getElementById('post-container');

    // Check if the post exists
    if (post) {
        // Format post date
        const postDate = new Date(post.postDateTime);

        // Fetch reply count for the post
        const replyCount = await fetchReplyCount(post.postId);

        // Fetch edit status for the post
        const postEditStatus = await fetchEditStatus(post.postId);

        // Display different headers based on who edited the post and who is logged in at the moment
        if (postEditStatus == false) {
            // If post has not been edited
            postHeader.innerHTML = `
                <div class="account">${await fetchAccountName(post.accId)}</div>
                <div class="datetime"><i class="bi bi-chat-dots-fill"></i>  ${replyCount} | ${formatDate(postDate)}</div>
            `
        } else if ((post.adminEdit == true && loginAccId != post.accId) || (post.adminEdit == true && loginAccId == post.accId)) {
            // If post has been edited by admin and user is logged in (does not matter if user accId same as accId of post owner)
            postHeader.innerHTML = `
                <div class="account">${await fetchAccountName(post.accId)}</div>
                <div class="datetime"><i class="bi bi-chat-dots-fill"></i>  ${replyCount} | <i class="bi bi-pencil-fill"></i>&nbsp<i>Edited by admin at ${formatDate(postDate)}</i></div>
            `
        } else if (post.adminEdit == false && postEditStatus == true) {
            // If the post is edited by the post owner
            postHeader.innerHTML = `
                <div class="account">${await fetchAccountName(post.accId)}</div>
                <div class="datetime"><i class="bi bi-chat-dots-fill"></i>  ${replyCount} | <i class="bi bi-pencil-fill"></i>&nbsp<i>Edited at ${formatDate(postDate)}</i></div>
            `
        }

        // Set the content of the existing <h1> tag to the post title
        const h1Title = document.querySelector('h1');
        h1Title.textContent = post.postTitle; // Replace with the actual title from post data

        // If user is owner of post or admin, show different view
        if (token && ((loginAccId == post.accId) || (loginAccRole == "admin"))) {
            postContainer.innerHTML = `
            <div class="post">
                <div class="text">${post.postText}</div>
                <div class="edit-bar">
                    <button class="btn edit-post"><i class="bi bi-pencil-fill"></i></button>
                    <button class="btn delete-post"><i class="bi bi-trash3-fill"></i></button>
                </div>
            </div>
            `;
            
            // Event listener for delete post button
            const deletePostButton = document.querySelector('.delete-post');
            deletePostButton.addEventListener('click', async () => {
                // When click delete post button
                const confirmed = confirm("Are you sure you want to delete this post?"); // Ask user if they confirm want to delete the post
                if (confirmed) {
                    try {
                        // If user confirm want to delete post, proceed to delete post
                        await deletePost(post.postId);
                    } catch (error) {
                        // If cannot delete post, log the error message and alert user that deletion of post has failed
                        console.error("Failed to delete post:", error);
                        alert('Failed to delete post.');
                    }
                }
            });

            // Event listener for edit post button
            const editPost = document.querySelector('.edit-post');
            editPost.addEventListener('click', async () => {
                // When click edit post button, redirect to edit post page
                window.location.href = `/editpost.html?id=${post.postId}`;
            });

        } else {
            // If user not admin or post owner, display as shown
            postContainer.innerHTML = `
            <div class="post no-hover">
                <div class="text">${post.postText}</div>
            </div>
            `;
        }
    } else {
        // If cannot find post, display "Post not found"
        postContainer.textContent = 'Post not found';
    }
}

// Async function to fetch replies for a specific post by postId
async function fetchReplies(postId) {
    const response = await fetch(`/replies/by-post/${postId}`); // Fetch replies data from API endpoint
    const data = await response.json(); // Convert response to JSON format

    // Get reply container element from HTML
    const replyContainer = document.getElementById('reply-container');
    replyContainer.innerHTML = "";

    // Display message if there are no replies
    if (data.length === 0) {
        replyContainer.innerHTML = "Leave a reply!";
        return;
    }

    // Loop through each reply and display it
    for (const reply of data) {
        const replyItem = document.createElement("div");
        replyItem.classList.add("reply"); // Add a CSS class for styling

        // Fetch account name associated with the reply
        const accountElement = document.createElement("div");
        accountElement.classList.add("account");
        accountElement.textContent = await fetchAccountName(reply.accId);

        // Format the reply date and time
        const dateTimeElement = document.createElement("div");
        dateTimeElement.classList.add("datetime");
        const replyDate = new Date(reply.replyDateTime);

        // Display different edit status for replies (by admin or reply owner)
        if (reply.replyEdited == 0) {
            dateTimeElement.textContent = formatDate(replyDate);
        } else if (reply.adminEdit == 1 && loginAccId != reply.accId) {
            dateTimeElement.textContent = `Edited by admin at ${formatDate(replyDate)}`;
        } else {
            dateTimeElement.textContent = `Edited at ${formatDate(replyDate)}`;
        }

        // Display reply text
        const textElement = document.createElement("div");
        textElement.classList.add("text");
        textElement.textContent = reply.replyText;

        // Create header element for reply (to hold account and datetime)
        const headerElement = document.createElement("div");
        headerElement.classList.add("boxheader");
        headerElement.appendChild(accountElement);
        headerElement.appendChild(dateTimeElement);

        replyItem.appendChild(headerElement);
        replyItem.appendChild(textElement);

        // Display edit options for replies if user is reply owner or admin
        if (token && ((loginAccId == reply.accId) || (loginAccRole == "admin"))) {
            replyItem.innerHTML += `
            <div class="edit-bar">
                <button class="btn edit-reply"><i class="bi bi-pencil-fill"></i></button>
                <button class="btn delete-reply"><i class="bi bi-trash3-fill"></i></button>
            </div>
            `
        }

        replyContainer.appendChild(replyItem);

        // Event listener for clicking on account name to view profile
        const accountButton = replyItem.querySelector('.account');
        accountButton.addEventListener('click', () => {
            // When click on account name, redirect to profile page
            window.location.href = `/profile.html?id=${reply.accId}`;
        });

        // Event listeners for edit and delete reply buttons
        if (token && ((loginAccId == reply.accId) || (loginAccRole == "admin"))) {
            const deleteReplyButton = replyItem.querySelector('.delete-reply');
            deleteReplyButton.addEventListener('click', async () => {
                // If click delete reply button, ask user if they confirm want to delete the reply
                const confirmed = confirm("Are you sure you want to delete this reply?");
                if (confirmed) {
                    try {
                        // If confirmed, delete the reply
                        await deleteReply(reply.replyId);
                        fetchReplies(postId); // Refresh the replies after deletion
                    } catch (error) {
                        // If failed to delete reply, log the error in console and alert user that reply deletion failed
                        console.error("Failed to delete reply:", error);
                        alert('Failed to delete reply.');
                    }
                }
            });

            const editReply = replyItem.querySelector('.edit-reply');
            editReply.addEventListener('click', async () => {
                // When click on edit reply, redirect to edit reply page
                window.location.href = `/editreply.html?id=${reply.replyId}`;
            });
        }
    };
}

// Async function to fetch account name based on account ID
async function fetchAccountName(accId) {
    const response = await fetch(`/accounts/${accId}`); // Fetch account data from API endpoint
    const account = await response.json(); // Convert response to JSON format
    return account.accName; // Return the account name
}

// Function to format date object into "dd/mm/yyyy hh:mm" format
function formatDate(ogDate) {
    const year = ogDate.getUTCFullYear();
    const month = String(ogDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(ogDate.getUTCDate()).padStart(2, '0');
    const hours = String(ogDate.getUTCHours()).padStart(2, '0');
    const minutes = String(ogDate.getUTCMinutes()).padStart(2, '0');
    const formattedDate = `${day}/${month}/${year}`;
    const formattedTime = `${hours}:${minutes}`;
    return `${formattedDate}, ${formattedTime}`; // Return the formatted datetime
}

// Async function to delete a post by postId
async function deletePost(postId) {
    // Fetch and delete the post if user is authorized (token matched)
    const response = await fetch(`/posts/${postId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        // If cannot delete post, alert user that post deletion failed
        alert('Failed to delete post.');
    } else {
        // Redirect to main discussion forum page
        window.location.href = '/discussionforum.html';
    }
}

// Asu=ync function to delete a reply by replyId
async function deleteReply(replyId) {
    // Fetch and delete the reply if user is authorized (token matched)
    const response = await fetch(`/replies/${replyId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    // If cannot delete reply, alert the user that reply deletion failed
    if (!response.ok) {
        alert('Failed to delete reply.');
    }
}

// Get postId from URL parameter
const postId = getUrlParams();

// Fetch and display post and replies based on postId
fetchPost(postId);
fetchReplies(postId);
fetchEditStatus(postId);

// Event listener for adding a reply
const addReply = document.getElementById("add-reply");
addReply.onclick = () => {
    if (token) {
        // If logged in (got token), redirect to add reply page
        window.location.href = `/addreply.html?id=${postId}`;
    } else {
        // If not, alert user that they need to log in to add a reply
        alert("You must be logged in to add a reply.")
    }

};

// Async function to fetch reply count for a specific post
async function fetchReplyCount(postId) {
    const response = await fetch(`/posts/${postId}/replyCount`); // Fetch reply count data from API endpoint
    const replyCount = await response.json(); // Convert response to JSON format
    return replyCount.replyCount; // Return the reply count of a specific post
}

// Async function to fetch edit status of a specific post
async function fetchEditStatus(postId) {
    const response = await fetch(`/posts/${postId}`); // Fetch edit status data from API endpoint
    const editStatus = await response.json(); // Convert response to JSON format
    return editStatus.postEdited; // Return the edit status of a specific post
}