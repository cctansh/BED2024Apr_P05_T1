// token
const token = sessionStorage.getItem('token');
const loginProfileLink = document.getElementById('login-profile-link');
const loginAccId = sessionStorage.getItem('loginAccId');
const loginAccRole = sessionStorage.getItem('loginAccRole');
const rToken = getCookie('rToken');

// Get postId form URL parameter
const postId = getUrlParams();

if (token && !isTokenExpired(token)) {
    loginProfileLink.innerHTML = `Profile`;
    loginProfileLink.setAttribute("href", `profile.html?id=${loginAccId}`)
} else if (rToken) {
    refreshToken(rToken);
} else {
    sessionStorage.clear()
    window.location.href = `/discussionpost.html?id=${postId}`;
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
    
            if (postTitleText.length > 255) {
                alert("Post title should be within 255 characters.");
                return;
            }
    
            if (!postContentText) {
                alert("Post content cannot be empty.");
                return;
            }
    
            if (postContentText.length > 8000) {
                alert("Post content should be within 8000 characters.");
                return;
            }

            // Construct updated post data object
            const newPostData = {
                postTitle: postTitleText,
                postText: postContentText,
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
                // If got error when editing post, log the error message in console and alert user about the error
                console.error("Error editing post:", error);
                alert("An error occurred while editing your post. Please try again later.");
            }
        }
    });
}

// new, to be checked again
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Fetch and display post details (for editing post)
fetchPost(postId);

function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the token payload
    const expiry = payload.exp * 1000; // Convert expiry time to milliseconds
    return Date.now() > expiry; // Check if the current time is past the expiry time
}

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing JWT token:', error);
        return null;
    }
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  function deleteCookie(cname) {
    document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }

  async function refreshToken(rToken) {
    try {
        const response = await fetch('/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${rToken}`
            }
        });
        if (!response.ok) {
            throw new Error(await response.text());
        }

        const result = await response.json();

        const token = result.token;
        const decodedToken = parseJwt(token);
        const loginAccId = decodedToken.accId;
        const loginAccRole = decodedToken.accRole;

        sessionStorage.setItem('token', token);
        sessionStorage.setItem('loginAccId', loginAccId);
        sessionStorage.setItem('loginAccRole', loginAccRole);
        
        location.reload();
    } catch {
        console.log("error")
        alert('Login timed out.');
        sessionStorage.clear();
        deleteCookie('rToken');   
        window.location.href = `/discussionpost.html?id=${postId}`;
    }
}