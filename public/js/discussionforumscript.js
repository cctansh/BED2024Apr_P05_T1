async function fetchPosts() {
    const response = await fetch("/posts");
    const data = await response.json();

    const postContainer = document.getElementById("post-container");

    for (const post of data) {
        const postItem = document.createElement("div");
        postItem.classList.add("post");

        postItem.onclick = () => {
            window.location.href = `/discussionpost.html?id=${post.accId}`;
        };

        // Create elements for title, account, etc. and populate with book data
        const accountElement = document.createElement("div");
        accountElement.classList.add("account");
        accountElement.textContent = await fetchAccountName(post.postId);

        const dateTimeElement = document.createElement("div");
        dateTimeElement.classList.add("datetime");
        // Format the date and time
        const postDate = new Date(post.postDateTime);
        const formattedDate = postDate.toLocaleDateString('en-CA'); // Format date as YYYY-MM-DD
        const formattedTime = postDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); // Format time as HH:MM

        dateTimeElement.textContent = `${formattedDate}, ${formattedTime}`;

        const textElement = document.createElement("div");
        textElement.classList.add("text");
        textElement.textContent = post.postText;

        // header to hold account and datetime
        const headerElement = document.createElement("div");
        headerElement.classList.add("postheader");


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