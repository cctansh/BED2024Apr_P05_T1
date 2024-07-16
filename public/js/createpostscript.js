// token
const token = sessionStorage.getItem('token');
const loginProfileLink = document.getElementById('login-profile-link');
const loginAccId = sessionStorage.getItem('loginAccId');
const loginAccRole = sessionStorage.getItem('loginAccRole');

if (token) {
    // If token exist, display profile link with person icon and link to profile page
    loginProfileLink.innerHTML = `Profile&ensp;<i class="bi bi-person-fill"></i>`;
    loginProfileLink.setAttribute("href", `profile.html?id=${loginAccId}`)
} else {
    // If no token, display login link with person icon and link to login page
    loginProfileLink.innerHTML = `Login&ensp;<i class="bi bi-person-fill"></i>`;
    loginProfileLink.setAttribute("href", 'loginreg.html')
}

// Cancel post creation
const cancelReply = document.getElementById("cancel-post"); // Retrieve cancel post button element
cancelReply.onclick = () => {
    // Redirect to discussion forum page when cancel button is clicked
    window.location.href = `/discussionforum.html`;
};

// Confirm post creation
const confirmReply = document.getElementById("confirm-post"); // Retrieve confirm post button element
const newPostTitleTextarea = document.getElementById("newposttitle"); // Retrieve new post title textarea element
const newPostContentTextarea = document.getElementById("newpostcontent"); // Retrieve new post content textarea element

const accId = parseInt(sessionStorage.getItem('loginAccId'));

confirmReply.addEventListener('click', async () => {
    const confirmed = confirm("Are you sure you want to create a new post?"); // Confirm post creation with user
    if (confirmed) {
        const postTitleText = newPostTitleTextarea.value.trim(); // Trim and retrieve post title text
        const postContentText = newPostContentTextarea.value.trim(); // Trim and retrieve post content text
        
        // Validation checks for post title and content
        if (!postTitleText) {
            alert("Post title cannot be empty.");
            return;
        }

        if (!postTitleText.length > 200) {
            alert("Post title should be within 200 characters.");
        }

        if (!postContentText) {
            alert("Post content cannot be empty.");
        }

        if (!postContentText.length > 10000) {
            alert("Post content should be within 10000 characters.");
        }

        // Data object for new post in JSON format
        const newPostData = {
            postTitle: postTitleText,
            postText: postContentText,
            accId: accId
        };

        try {
            // Send POST request to create new post
            const response = await fetch('/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newPostData)
            });

            if (response.ok) {
                // If successful, redirects to the new post page
                const responseData = await response.json();
                const postId = responseData.postId;
                window.location.href = `/discussionpost.html?id=${postId}`;          
            } else {
                // If error, alert user with error message details
                const errorData = await response.json();
                alert(`Error: ${errorData.message}\nDetails: ${errorData.errors.join(', ')}`);
            }
        } catch (error) {
            // Log and alert user about creation error
            console.error("Error creating post:", error);
            alert("An error occurred while creating your post. Please try again later.");
        }
    }
});