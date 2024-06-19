// token
const token = localStorage.getItem('token');
const loginProfileLink = document.getElementById('login-profile-link');
const loginAccId = localStorage.getItem('loginAccId');

if (token) {
    loginProfileLink.innerHTML = `Profile&ensp;<i class="bi bi-person-fill"></i>`;
    loginProfileLink.setAttribute("href", `profile.html?id=${loginAccId}`)
} else {
    loginProfileLink.innerHTML = `Login&ensp;<i class="bi bi-person-fill"></i>`;
    loginProfileLink.setAttribute("href", 'loginreg.html')
}

// cancel post creation
const cancelReply = document.getElementById("cancel-post");
cancelReply.onclick = () => {
    window.location.href = `/discussionforum.html`;
};

// confirm post creation
const confirmReply = document.getElementById("confirm-post");
const newPostTitleTextarea = document.getElementById("newposttitle");
const newPostContentTextarea = document.getElementById("newpostcontent");

const accId = parseInt(localStorage.getItem('loginAccId'));

confirmReply.addEventListener('click', async () => {
    const confirmed = confirm("Are you sure you want to create a new post?");
    if (confirmed) {
        const postTitleText = newPostTitleTextarea.value.trim();
        const postContentText = newPostContentTextarea.value.trim();
        
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

        const newPostData = {
            postTitle: postTitleText,
            postText: postContentText,
            accId: accId
        };

        try {
            const response = await fetch('/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newPostData)
            });

            if (response.ok) {
                const responseData = await response.json();
                const postId = responseData.postId;
                window.location.href = `/discussionpost.html?id=${postId}`;          
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}\nDetails: ${errorData.errors.join(', ')}`);
            }
        } catch (error) {
            console.error("Error creating post:", error);
            alert("An error occurred while creating your post. Please try again later.");
        }
    }
});