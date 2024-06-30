// token
const token = localStorage.getItem('token');
const loginProfileLink = document.getElementById('login-profile-link');
const loginAccId = localStorage.getItem('loginAccId');
const loginAccRole = localStorage.getItem('loginAccRole');

if (token) {
    loginProfileLink.innerHTML = `Profile&ensp;<i class="bi bi-person-fill"></i>`;
    loginProfileLink.setAttribute("href", `profile.html?id=${loginAccId}`)
} else {
    loginProfileLink.innerHTML = `Login&ensp;<i class="bi bi-person-fill"></i>`;
    loginProfileLink.setAttribute("href", 'loginreg.html')
}

function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

async function fetchPost(postId) {
    const response = await fetch(`/posts/${postId}`);
    const post = await response.json();

    const newPostTitleTextarea = document.getElementById("newposttitle");
    const newPostContentTextarea = document.getElementById("newpostcontent");

    // set text area as post title and post content
    newPostTitleTextarea.value = post.postTitle;
    newPostContentTextarea.value = post.postText;

    // cancel post
    const cancelPost = document.getElementById("cancel-post");
    cancelPost.onclick = () => {
        window.location.href = `/discussionpost.html?id=${post.postId}`;
    };

    //confirm edit
    const confirmPost = document.getElementById("confirm-post");

    confirmPost.addEventListener('click', async () => {
        const confirmed = confirm("Save changes?");
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
                postText: postContentText
            };

            try {
                const response = await fetch(`/posts/${post.postId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newPostData)
                });

                if (response.ok) {
                    window.location.href = `/discussionpost.html?id=${post.postId}`;
                } else {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.message}\nDetails: ${errorData.errors.join(', ')}`);
                }
            } catch (error) {
                console.error("Error adding post:", error);
                alert("An error occurred while creating your post. Please try again later.");
            }
        }
    });
}

const postId = getUrlParams();
console.log(postId)

fetchPost(postId);
