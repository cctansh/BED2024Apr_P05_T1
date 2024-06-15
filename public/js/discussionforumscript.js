// token
const token = localStorage.getItem('token');
const loginProfileLink = document.getElementById('login-profile-link');

if (token) {
    loginProfileLink.innerHTML = `Profile&ensp;<i class="bi bi-person-fill"></i>`;
} else {
    loginProfileLink.innerHTML = `Login&ensp;<i class="bi bi-person-fill"></i>`;
}

async function fetchPosts() {
    const response = await fetch("/posts");
    const data = await response.json();

    const postContainer = document.getElementById("post-container");

    for (const post of data) {
        const postItem = document.createElement("div");
        postItem.classList.add("post");

        postItem.onclick = () => {
            window.location.href = `/discussionpost.html?id=${post.postId}`;
        };

        // Create elements for title, account, etc. and populate with book data
        const accountElement = document.createElement("div");
        accountElement.classList.add("account");
        accountElement.textContent = await fetchAccountName(post.accId);

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

        dateTimeElement.textContent = `${formattedDate}, ${formattedTime}`;

        const textElement = document.createElement("div");
        textElement.classList.add("text");
        textElement.textContent = post.postText;

        // header to hold account and datetime
        const headerElement = document.createElement("div");
        headerElement.classList.add("boxheader");


        // ... add more elements for other book data (optional)

        headerElement.appendChild(accountElement);
        headerElement.appendChild(dateTimeElement);

        postItem.appendChild(headerElement);
        postItem.appendChild(textElement);
        // ... append other elements

        postContainer.appendChild(postItem);
    };
}

async function fetchAccountName(accId) {
    const response = await fetch(`/accounts/${accId}`);
    const account = await response.json();
    return account.accName;
}

fetchPosts(); // Call the function to fetch and display book data