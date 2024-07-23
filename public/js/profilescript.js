// Retrieve token from session storage
const token = sessionStorage.getItem('token');

// Get the login/profile link element by its ID
const loginProfileLink = document.getElementById('login-profile-link');

// Retrieve account ID and role from session storage
const loginAccId = sessionStorage.getItem('loginAccId');
const loginAccRole = sessionStorage.getItem('loginAccRole');

// Retrieve refresh token from cookies
const rToken = getCookie('rToken');

// Get the profile ID from the URL parameters
const profileId = getUrlParams();
console.log(profileId); // Log the profile ID for debugging purposes

// Check if the token exists and is not expired
if (token && !isTokenExpired(token)) {
    // If token is valid, update the login/profile link to point to the user's profile
    loginProfileLink.innerHTML = `Profile`;
    loginProfileLink.setAttribute("href", `profile.html?id=${loginAccId}`);
} else if (rToken) {
    // If the token is expired but a refresh token exists, attempt to refresh the token
    refreshToken(rToken);
} else {
    // If neither token nor refresh token exists, clear the session storage
    sessionStorage.clear();
    // Update the login/profile link to point to the login/registration page
    loginProfileLink.innerHTML = `Login`;
    loginProfileLink.setAttribute("href", 'loginreg.html');
}

// Function to get URL parameters
function getUrlParams() {
    // Create a URLSearchParams object from the query string
    const urlParams = new URLSearchParams(window.location.search);
    // Get the 'id' parameter from the URL
    const id = urlParams.get('id');
    console.log('Profile ID:', id); // Debug statement to log the profile ID
    return id; // Return the profile ID
}

// Asynchronously fetch posts and replies based on the profile ID
async function fetchPostsAndReplies(profileId) {
    try {
        // Fetch data from the server using the profile ID
        const response = await fetch(`/accounts/postreply/${profileId}`);

        // Check if the response is not OK (e.g., status 404 or 500)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Read the response text
        const postreplyText = await response.text();
        let postreply;
        try {
            // Parse the response text as JSON
            postreply = JSON.parse(postreplyText);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return;
        }

        // Check if the parsed data is an array and not empty
        if (!Array.isArray(postreply) || postreply.length === 0) {
            const container = document.getElementById("postreply");
            container.innerHTML = "This user has not made any posts or replies.";
            return;
        }

        // Process each post or reply object
        for (const obj of postreply) {
            if (obj.type === 'Post') {
                // Fetch and display post data
                await fetchPost(obj);
            } else if (obj.type === 'Reply') {
                // Fetch and display replied post data
                await fetchRepliedPost(obj.id);
                await fetchReply(obj);
            }
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// Asynchronously fetch and display post data
async function fetchPost(obj) {
    const container = document.getElementById("postreply");

    // Create a container for the post
    const postItem = document.createElement("div");
    postItem.classList.add('post');

    // Set an on-click event to navigate to the discussion post page
    postItem.onclick = (e) => {
        e.stopPropagation();
        window.location.href = `/discussionpost.html?id=${obj.id}`;
    };

    // Create elements for account name and fetch the account name
    const accountElement = document.createElement("div");
    accountElement.classList.add("account");
    accountElement.textContent = await fetchAccountName(obj.accId);

    // Fetch the reply count for the post
    const replyCount = await fetchReplyCount(obj.id);

    // Create elements for date and time
    const dateTimeElement = document.createElement("div");
    dateTimeElement.classList.add("datetime");

    const postDate = new Date(obj.dateTime);
    if (obj.edited === 0) {
        dateTimeElement.innerHTML = `<i class="bi bi-chat-dots-fill"></i>  ${replyCount} | ${formatDate(postDate)}`;
    } else {
        dateTimeElement.innerHTML = `<i class="bi bi-chat-dots-fill"></i>  ${replyCount} | Edited at ${formatDate(postDate)}`;
    }

    // Create an element for the post title
    const textElement = document.createElement("div");
    textElement.classList.add("text");
    textElement.classList.add("title");
    textElement.textContent = obj.title;

    // Create a header element to hold account and date-time elements
    const headerElement = document.createElement("div");
    headerElement.classList.add("boxheader");

    headerElement.appendChild(accountElement);
    headerElement.appendChild(dateTimeElement);

    // Append header and text elements to the post container
    postItem.appendChild(headerElement);
    postItem.appendChild(textElement);

    // If the user is logged in and is the post owner or an admin, show edit and delete buttons
    if (token && ((loginAccId === obj.accId) || (loginAccRole === "admin"))) {
        postItem.innerHTML += `
        <div class="edit-bar">
            <button class="btn edit-reply"><i class="bi bi-pencil-fill"></i></button>
            <button class="btn delete-reply"><i class="bi bi-trash3-fill"></i></button>
        </div>
        `;
    }

    // Append the post container to the main container
    container.appendChild(postItem);

    // Add an event listener to navigate to the profile page on account name click
    const accountButton = postItem.querySelector('.account');
    accountButton.addEventListener('click', (e) => {
        e.stopPropagation();
        window.location.href = `/profile.html?id=${obj.accId}`;
    });
}

// Asynchronously fetch and display reply data
async function fetchReply(obj) {
    const container = document.getElementById("postreply");

    // Create a container for the reply
    const replyBox = document.createElement("div");
    replyBox.classList.add("reply-box");

    // Create a connector element for visual representation
    const connector = document.createElement("div");
    connector.classList.add("connector");
    connector.innerHTML = `
        <img src="../img/connect.png"></img>
    `;

    // Create a container for the reply content
    const replyItem = document.createElement("div");
    replyItem.classList.add("reply");

    // Set an on-click event to navigate to the discussion post page
    replyItem.onclick = (e) => {
        e.stopPropagation();
        window.location.href = `/discussionpost.html?id=${obj.replyto}`;
    };

    // Create elements for account name and fetch the account name
    const accountElement = document.createElement("div");
    accountElement.classList.add("account");
    accountElement.textContent = await fetchAccountName(obj.accId);

    // Create elements for date and time
    const replyDate = new Date(obj.dateTime);
    const dateTimeElement = document.createElement("div");
    dateTimeElement.classList.add("datetime");
    if (obj.edited === 0) {
        dateTimeElement.textContent = formatDate(replyDate);
    } else if (obj.adminEdited === 1) {
        dateTimeElement.textContent = `Edited by admin at ${formatDate(replyDate)}`;
    } else {
        dateTimeElement.textContent = `Edited at ${formatDate(replyDate)}`;
    }

    // Create an element for the reply text
    const textElement = document.createElement("div");
    textElement.classList.add("text");
    textElement.textContent = obj.text;

    // Create a header element to hold account and date-time elements
    const headerElement = document.createElement("div");
    headerElement.classList.add("boxheader");

    headerElement.appendChild(accountElement);
    headerElement.appendChild(dateTimeElement);

    // Append header and text elements to the reply container
    replyItem.appendChild(headerElement);
    replyItem.appendChild(textElement);

    // If the user is logged in and is the reply owner or an admin, show edit and delete buttons
    if (token && ((loginAccId === obj.accId) || (loginAccRole === "admin"))) {
        replyItem.innerHTML += `
        <div class="edit-bar">
            <button class="btn edit-reply"><i class="bi bi-pencil-fill"></i></button>
            <button class="btn delete-reply"><i class="bi bi-trash3-fill"></i></button>
        </div>
        `;
    }

    // Append the connector and reply container to the main container
    replyBox.appendChild(connector);
    replyBox.appendChild(replyItem);

    container.appendChild(replyBox);

    // Add an event listener to navigate to the profile page on account name click
    const accountButton = replyItem.querySelector('.account');
    accountButton.addEventListener('click', (e) => {
        e.stopPropagation();
        window.location.href = `/profile.html?id=${obj.accId}`;
    });

    // Add event listeners for edit and delete buttons if they are present
    if (token && ((loginAccId === obj.accId) || (loginAccRole === "admin"))) {
        const deleteReplyButton = replyItem.querySelector('.delete-reply');
        deleteReplyButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            const confirmed = confirm("Are you sure you want to delete this reply?");
            if (confirmed) {
                try {
                    await deleteReply(obj.id);
                    window.location.href = `/profile.html?id=${obj.accId}`;
                } catch (error) {
                    console.error("Failed to delete reply:", error);
                    alert('Failed to delete reply.');
                }
            }
        });

        const editReply = replyItem.querySelector('.edit-reply');
        editReply.addEventListener('click', async (e) => {
            e.stopPropagation();
            window.location.href = `/editreply.html?id=${obj.id}`;
        });
    }
}

// Asynchronously fetch and display the original post for a given reply ID
async function fetchRepliedPost(replyId) {
    // Fetch the post associated with the given reply ID
    const response = await fetch(`/replies/post/${replyId}`);
    const post = await response.json();

    // Get the container element where the post will be displayed
    const container = document.getElementById("postreply");

    // Create a container for the post
    const postItem = document.createElement("div");
    postItem.classList.add('post-addreply');

    // Set an on-click event to navigate to the discussion post page
    postItem.onclick = (e) => {
        e.stopPropagation();
        window.location.href = `/discussionpost.html?id=${post.postId}`;
    };

    // Create an element for the account name and fetch the account name
    const accountElement = document.createElement("div");
    accountElement.classList.add("account");
    accountElement.textContent = await fetchAccountName(post.accId);

    // Fetch the reply count for the post
    const replyCount = await fetchReplyCount(post.postId);

    // Create an element for date and time
    const dateTimeElement = document.createElement("div");
    dateTimeElement.classList.add("datetime");

    // Format the date and time of the post
    const postDate = new Date(post.postDateTime);
    if (post.postEdited == 0) {
        dateTimeElement.innerHTML = `<i class="bi bi-chat-dots-fill"></i>  ${replyCount} | ${formatDate(postDate)}`;
    } else {
        dateTimeElement.innerHTML = `<i class="bi bi-chat-dots-fill"></i>  ${replyCount} | Edited at ${formatDate(postDate)}`;
    }

    // Create an element for the post title
    const textElement = document.createElement("div");
    textElement.classList.add("text");
    textElement.classList.add("title");
    textElement.textContent = post.postTitle;

    // Create a header element to hold account and date-time elements
    const headerElement = document.createElement("div");
    headerElement.classList.add("boxheader");

    // Append account and date-time elements to the header
    headerElement.appendChild(accountElement);
    headerElement.appendChild(dateTimeElement);

    // Append the header and text elements to the post container
    postItem.appendChild(headerElement);
    postItem.appendChild(textElement);

    // If the user is logged in and is the post owner or an admin, show edit and delete buttons
    if (token && ((loginAccId == post.accId) || (loginAccRole == "admin"))) {
        postItem.innerHTML += `
        <div class="edit-bar">
            <button class="btn edit-reply"><i class="bi bi-pencil-fill"></i></button>
            <button class="btn delete-reply"><i class="bi bi-trash3-fill"></i></button>
        </div>
        `;
    }

    // Append the post container to the main container
    container.appendChild(postItem);

    // Add an event listener to navigate to the profile page on account name click
    const accountButton = postItem.querySelector('.account');
    accountButton.addEventListener('click', (e) => {
        e.stopPropagation();
        window.location.href = `/profile.html?id=${post.accId}`;
    });
}

// Function to format a date object into a readable string
function formatDate(ogDate) {
    const year = ogDate.getUTCFullYear();
    const month = String(ogDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(ogDate.getUTCDate()).padStart(2, '0');
    const hours = String(ogDate.getUTCHours()).padStart(2, '0');
    const minutes = String(ogDate.getUTCMinutes()).padStart(2, '0');
    const formattedDate = `${day}/${month}/${year}`;
    const formattedTime = `${hours}:${minutes}`;
    return `${formattedDate}, ${formattedTime}`;
}

// Function to fetch the account name based on account ID
async function fetchAccountName(accId) {
    const response = await fetch(`/accounts/${accId}`);
    const account = await response.json();
    return account.accName;
}

// Function to fetch the reply count for a given post ID
async function fetchReplyCount(postId) {
    const response = await fetch(`/posts/${postId}/replyCount`);
    const replyCount = await response.json();
    return replyCount.replyCount;
}

// Function to delete a reply based on reply ID
async function deleteReply(replyId) {
    const response = await fetch(`/replies/${replyId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        alert('Failed to delete reply.');
    }
}

// Function to set the profile name in the UI
async function setProfileName(profileId) {
    const profileName = await fetchAccountName(profileId);
    document.getElementById("profile-name").textContent = `${profileName}'s Profile`;
}

// Function to set admin indicator and admin view based on account role
async function setAdminIndicatorAndView(profileId) {
    const adminIndicator = document.getElementById('admin');
    const adminView = document.getElementById('adminView');
    const profileRole = await fetchAccountRole(profileId);
    if (profileRole == 'admin') {
        adminIndicator.classList.remove('hide');
    } else if (loginAccRole == 'admin') {
        adminView.classList.remove('hide');
    }
}

// Function to fetch the account role based on account ID
async function fetchAccountRole(accId) {
    const response = await fetch(`/accounts/${accId}`);
    const account = await response.json();
    return account.accRole;
}

// Function to delete an account based on profile ID
async function deleteAccount(profileId) {
    try {
        fetch('/accounts/' + profileId, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
    } catch (err) {
        console.log('Deletion failed: ' + err.message);
    }
}

// Function to update the account role to "admin" for a given profile ID
async function updateAccountRole(profileId) {
    const changeRoleData = {
        accRole: "admin"
    };
    try {
        const response = await fetch(`/accounts/role/${profileId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(changeRoleData)
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }
    } catch (err) {
        console.log('Change role failed: ' + err.message);
    }
}

// Function to delete the refresh token from the server
async function deleteRefreshToken(rToken) {
    try {
        fetch('/logout', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${rToken}`
            }
        })
        console.log("Refresh token deleted");
    } catch (err) {
        console.log('Deletion failed: ' + err.message);
    }
}

// Add event listener to the logout button
const logoutButton = document.getElementById('logout');
logoutButton.addEventListener('click', async () => {
    const confirmed = confirm("Are you sure you want to log out?");
    if (confirmed) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('loginAccId');
        sessionStorage.removeItem('loginAccRole');
        await deleteRefreshToken(rToken);
        deleteCookie('rToken');
        window.location.href = 'loginreg.html'; // Redirect to login page after logout
    }
});

// Add event listener to the delete account button
const deleteAccButton = document.getElementById('delete-acc');
deleteAccButton.addEventListener('click', async () => {
    const confirmed = confirm("Are you sure you want to delete your account?");
    if (confirmed) {
        await deleteAccount(profileId);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('loginAccId');
        sessionStorage.removeItem('loginAccRole');
        deleteCookie('rToken');
        alert('Account deleted. Returning to login page.');
        window.location.href = 'loginreg.html'; // Redirect to login page after account deletion
    }
});

// Add event listener to the change password button
const changePasswordButton = document.getElementById('change-password');
changePasswordButton.addEventListener('click', () => {
    window.location.href = `/changepassword.html?id=${profileId}`;
});

// Add event listener to the change name button
const changeNameButton = document.getElementById('change-name');
changeNameButton.addEventListener('click', () => {
    window.location.href = `/changename.html?id=${profileId}`;
});

// Add event listener to the change email button
const changeEmailButton = document.getElementById('change-email');
changeEmailButton.addEventListener('click', () => {
    window.location.href = `/changeemail.html?id=${profileId}`;
});

// Admin-specific functionality

// Add event listener to the change role button for admin
const changeRoleButton = document.getElementById('change-role');
changeRoleButton.addEventListener('click', async () => {
    const confirmed = confirm("Are you sure you want to make this user an admin?");
    if (confirmed) {
        await updateAccountRole(profileId);
        alert('Role changed to admin successfully');
        window.location.href = `/profile.html?id=${profileId}`; // Refresh page after role change
    }
});

// Add event listener to the delete account button for admin
const deleteAccAdminButton = document.getElementById('delete-acc-admin');
deleteAccAdminButton.addEventListener('click', async () => {
    const confirmed = confirm("Are you sure you want to delete this account?");
    if (confirmed) {
        await deleteAccount(profileId);
        alert('Account deleted. Returning to home page.');
        window.location.href = 'index.html'; // Redirect to home page after account deletion
    }
});

// Set the profile name and admin view on page load
setProfileName(profileId);
setAdminIndicatorAndView(profileId);

// Hide settings if the logged-in user is not the profile owner
if (loginAccId != profileId) {
  document.getElementById('settings').classList.add('hide');  
} 

// Fetch posts and replies for the profile
fetchPostsAndReplies(profileId);

// Function to check if a token is expired
function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the token payload
    const expiry = payload.exp * 1000; // Convert expiry time to milliseconds
    return Date.now() > expiry; // Check if the current time is past the expiry time
}

// Function to parse a JWT token
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

// Function to get a cookie value by name
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
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

// Function to delete a cookie by name
function deleteCookie(cname) {
    document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// Function to refresh the token using the refresh token
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
        
        location.reload(); // Reload the page after refreshing the token
    } catch {
        console.log("Error refreshing token");
        alert('Login timed out.');
        sessionStorage.clear();
        deleteCookie('rToken');   
        location.reload(); // Reload the page on error
    }
}
