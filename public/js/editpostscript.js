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

// Function to get 'id' parameter from the URL query string
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Async function to fetch post details by postId and populate edit form
async function fetchPost(postId) {
    // Fetch post data from server
    const response = await fetch(`/posts/${postId}`); // Fetch post data from API endpoint
    const post = await response.json(); // Convert response to JSON format

    // Get text areas for post title and content from HTML
    const newPostTitleTextarea = document.getElementById("newposttitle");
    const newPostContentTextarea = document.getElementById("newpostcontent");

    // Set values of text areas to current post title and content
    newPostTitleTextarea.value = post.postTitle;
    newPostContentTextarea.value = post.postText;

    // Event listener for cancel button
    const cancelPost = document.getElementById("cancel-post");
    cancelPost.onclick = () => {
        // When click on cancel button, redirect back to the specific post page
        window.location.href = `/discussionpost.html?id=${post.postId}`;
    };

    // Event listener for confirm button
    const confirmPost = document.getElementById("confirm-post");

    // When click on confirm button
    confirmPost.addEventListener('click', async () => {
        // Ask user if they really want to save their changes
        const confirmed = confirm("Save changes?");
        if (confirmed) {
            // If confirm, trim and validate post title and content
            const postTitleText = newPostTitleTextarea.value.trim();
            const postContentText = newPostContentTextarea.value.trim();
            
            if (!postTitleText) {
                alert("Post title cannot be empty.");
                return;
            }
    
            if (!postTitleText.length > 200) {
                alert("Post title should be within 200 characters.");
                return;
            }
    
            if (!postContentText) {
                alert("Post content cannot be empty.");
                return;
            }
    
            if (!postContentText.length > 10000) {
                alert("Post content should be within 10000 characters.");
                return;
            }

            // Determine admin edit status
            let adminEdit = 0;
            if (loginAccRole == 'admin') {
                adminEdit = 1;
            }

            // Construct updated post data object
            const newPostData = {
                postTitle: postTitleText,
                postText: postContentText,
                adminEdit: adminEdit
            };

            try {
                // Send updated post data to server via PUT request, given that they are authorized
                const response = await fetch(`/posts/${post.postId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(newPostData)
                });

                // Check if update is successful
                if (response.ok) {
                    // If successful, redirect back to specific post page
                    window.location.href = `/discussionpost.html?id=${post.postId}`;
                } else {
                    // If failed, display error message
                    const errorData = await response.json();
                    alert(`Error: ${errorData.message}\nDetails: ${errorData.errors.join(', ')}`);
                }
            } catch (error) {
                // If got error when adding post, log the error message in console and alert user about the error
                console.error("Error adding post:", error);
                alert("An error occurred while creating your post. Please try again later.");
            }
        }
    });
}

// Get postId form URL parameter
const postId = getUrlParams();
console.log(postId)

// Fetch and display post details (for editing post)
fetchPost(postId);
