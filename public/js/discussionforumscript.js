// token
const token = sessionStorage.getItem('token');
const loginProfileLink = document.getElementById('login-profile-link');
const loginAccId = sessionStorage.getItem('loginAccId');
const loginAccRole = sessionStorage.getItem('loginAccRole');

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

// Async function to fetch posts from server
async function fetchPosts() {
    const response = await fetch("/posts"); // Fetch posts data from API endpoint
    const data = await response.json(); // Convert response to JSON format

    const postContainer = document.getElementById("post-container"); // Get post container by its ID from HTML page

    // Loop through each post in fetched data
    for (const post of data) {
        // Create a div element for each post
        const postItem = document.createElement("div");
        postItem.classList.add("post");

        // When click on a post, navigate to the post's page
        postItem.onclick = () => {
            window.location.href = `/discussionpost.html?id=${post.postId}`;
        };

        // Fetch account name associated with the post
        const accountElement = document.createElement("div");
        accountElement.classList.add("account");
        accountElement.textContent = await fetchAccountName(post.accId);

        // Fetch reply count for the post
        const replyCount = await fetchReplyCount(post.postId);

        // Fetch edit status of the post
        const postEditStatus = await fetchEditStatus(post.postId);

        // Create div for date and time information of the post
        const dateTimeElement = document.createElement("div");
        dateTimeElement.classList.add("datetime");
        const postDate = new Date(post.postDateTime); // Convert post date string to Date object
        const year = postDate.getUTCFullYear();
        const month = String(postDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(postDate.getUTCDate()).padStart(2, '0');
        const hours = String(postDate.getUTCHours()).padStart(2, '0');
        const minutes = String(postDate.getUTCMinutes()).padStart(2, '0');
        const formattedDate = `${day}/${month}/${year}`;
        const formattedTime = `${hours}:${minutes}`;

        // Display reply count and datetime
        if (postEditStatus === true) {
            dateTimeElement.innerHTML = `<i class="bi bi-pencil-fill"></i>&nbsp<i>Edited</i>&nbsp&nbsp&nbsp&nbsp&nbsp<i class="bi bi-chat-dots-fill"></i>  ${replyCount} | ${formattedDate}, ${formattedTime}`;
        } else {
            dateTimeElement.innerHTML = `<i class="bi bi-chat-dots-fill"></i>  ${replyCount} | ${formattedDate}, ${formattedTime}`;
        }
        
        // Create a div that contains text and title
        const textElement = document.createElement("div");
        textElement.classList.add("text");
        textElement.classList.add("title");
        textElement.textContent = post.postTitle;

        // Create header element to hold account and datetime
        const headerElement = document.createElement("div");
        headerElement.classList.add("boxheader");
        headerElement.appendChild(accountElement);
        headerElement.appendChild(dateTimeElement);

        // Append elements to post item
        postItem.appendChild(headerElement);
        postItem.appendChild(textElement);

        // Append post item to post container
        postContainer.appendChild(postItem);
    };
}

// Async function to fetch account name based on account ID
async function fetchAccountName(accId) {
    const response = await fetch(`/accounts/${accId}`); // Fetch account data from API endpoint
    const account = await response.json(); // Convert response to JSON format
    return account.accName; // Return the account name
}

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

fetchPosts(); // Call the function to fetch and display posts

// Event listener for creating a new post
const createPost = document.getElementById("create-post");
// When clicking on "Create Post"
createPost.onclick = () => {
    // Check if user is logged in (token exist)
    if (token) {
        window.location.href = `/createpost.html`; // Redirect to create post page
    } else {
        // If no token, alert user to login/register to create a post
        alert("You must be logged in to create a post.")
    }
};