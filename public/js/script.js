async function fetchPosts() {
    const response = await fetch("/posts"); // Replace with your API endpoint
    const data = await response.json();

    const list = document.getElementById("list");

    data.forEach((post) => {
        const postItem = document.createElement("div");
        postItem.classList.add("post"); // Add a CSS class for styling

        postItem.onclick = () => {
            window.location.href = `/discussionpost.html?id=${post.postId}`;
        };

        // Create elements for title, author, etc. and populate with book data
        const authorElement = document.createElement("div");
        authorElement.classList.add("author");
        authorElement.textContent = post.postAuthor;

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

        // header to hold author and datetime
        const headerElement = document.createElement("div");
        headerElement.classList.add("postheader");


        // ... add more elements for other book data (optional)

        headerElement.appendChild(authorElement);
        headerElement.appendChild(dateTimeElement);

        postItem.appendChild(headerElement);
        postItem.appendChild(textElement);
        // ... append other elements

        list.appendChild(postItem);
    });
}

fetchPosts(); // Call the function to fetch and display book data