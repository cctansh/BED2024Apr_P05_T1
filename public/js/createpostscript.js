// token
const token = sessionStorage.getItem('token');
const loginProfileLink = document.getElementById('login-profile-link');
const loginAccId = sessionStorage.getItem('loginAccId');
const loginAccRole = sessionStorage.getItem('loginAccRole');
const rToken = getCookie('rToken');

if (token && !isTokenExpired(token)) {
    loginProfileLink.innerHTML = `Profile`;
    loginProfileLink.setAttribute("href", `profile.html?id=${loginAccId}`)
} else if (rToken) {
    refreshToken(rToken);
} else {
    sessionStorage.clear()
    window.location.href = `/discussionforum.html`;
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
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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
        window.location.href = `/discussionforum.html`;
    }
}