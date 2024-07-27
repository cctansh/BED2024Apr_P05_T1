// Add an event listener to execute when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', async function () {
    console.log('DOM fully loaded and parsed');
    await loadQuestionAndAnswers(); // Load question and answers once the DOM is ready
});

// Function to navigate back to the previous page
function goBack() {
    window.history.back(); // Go back to the previous page in the browser history
}

// Retrieve token and user profile information from session storage
const token = sessionStorage.getItem('token');
const loginProfileLink = document.getElementById('login-profile-link');
const loginAccId = sessionStorage.getItem('loginAccId');
const loginAccRole = sessionStorage.getItem('loginAccRole');
const rToken = getCookie('rToken'); // Get refresh token from cookies

// Check if token is available and not expired
if (token && !isTokenExpired(token)) {
    loginProfileLink.innerHTML = `Profile`; // Set profile link text
    loginProfileLink.setAttribute("href", `profile.html?id=${loginAccId}`); // Set profile link URL
} else if (rToken) {
    refreshToken(rToken); // Attempt to refresh the token using the refresh token
} else {
    sessionStorage.clear(); // Clear session storage if no valid token is found
    window.location.href = `/index.html`; // Redirect to the homepage
}

// Function to check if the token has expired
function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the JWT payload
    const expiry = payload.exp * 1000; // Convert expiration time to milliseconds
    return Date.now() > expiry; // Check if the current time is past the expiration time
}

// Function to parse JWT token and extract payload
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1]; // Get the payload part of the token
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Replace URL-safe characters
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); // Convert payload to JSON
        }).join(''));

        return JSON.parse(jsonPayload); // Return the JSON payload
    } catch (error) {
        console.error('Error parsing JWT token:', error); // Log parsing error
        return null; // Return null if an error occurs
    }
}

// Function to get the value of a cookie by name
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie); // Decode the cookie string
    let ca = decodedCookie.split(';'); // Split cookies into an array
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1); // Trim leading spaces
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length); // Return the cookie value
        }
    }
    return ""; // Return empty string if cookie not found
}

// Function to delete a cookie by name
function deleteCookie(cname) {
    document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; // Set cookie to expire in the past
}

// Function to refresh the JWT token using a refresh token
async function refreshToken(rToken) {
    try {
        const response = await fetch('/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${rToken}` // Send the refresh token in the Authorization header
            }
        });
        if (!response.ok) {
            throw new Error(await response.text()); // Throw an error if response is not OK
        }

        const result = await response.json(); // Parse the JSON response

        const token = result.token; // Get the new token from the response
        const decodedToken = parseJwt(token); // Decode the new token
        const loginAccId = decodedToken.accId; // Extract account ID from the decoded token
        const loginAccRole = decodedToken.accRole; // Extract account role from the decoded token

        sessionStorage.setItem('token', token); // Store the new token in session storage
        sessionStorage.setItem('loginAccId', loginAccId); // Store account ID in session storage
        sessionStorage.setItem('loginAccRole', loginAccRole); // Store account role in session storage

        location.reload(); // Reload the page to apply changes
    } catch {
        console.log("error");
        alert('Login timed out.'); // Alert user if there is an error
        sessionStorage.clear(); // Clear session storage
        deleteCookie('rToken'); // Delete the refresh token cookie
        window.location.href = `/index.html`; // Redirect to the homepage
    }
}

// Function to load question and answers based on question ID from URL
async function loadQuestionAndAnswers() {
    const questionId = new URLSearchParams(window.location.search).get('id') || '1'; // Get question ID from URL or default to '1'
    const token = sessionStorage.getItem('token');

    try {
        const questionResponse = await fetch(`/quiz/questions/${questionId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // Send the token in the Authorization header
            }
        });

        if (!questionResponse.ok) {
            throw new Error('Failed to fetch question data'); // Throw an error if response is not OK
        }

        const questionData = await questionResponse.json(); // Parse the JSON response
        console.log('Fetched question data:', questionData);

        document.getElementById('questionText').innerText = questionData.question; // Display the question text

        const answersResponse = await fetch(`/quiz/answers/${questionId}`, {
            headers: {
                'Authorization': `Bearer ${token}` // Send the token in the Authorization header
            }
        });

        if (!answersResponse.ok) {
            throw new Error('Failed to fetch answers data'); // Throw an error if response is not OK
        }

        const answersData = await answersResponse.json(); // Parse the JSON response
        console.log('Fetched answers data:', answersData);

        const answersContainer = document.getElementById('editAnswersContainer');
        answersContainer.innerHTML = ''; // Clear existing answers

        answersData.forEach(answer => {
            addAnswer(answer.answer_text, answer.is_correct, answer.id, answer.explanation); // Add each answer to the UI
        });
    } catch (error) {
        console.error('Error fetching question or answers data:', error); // Log any errors
    }
}

// Function to add a new answer input group to the form
function addAnswer(text = '', isCorrect = false, answerId = null, explanation = '') {
    const answerGroup = document.createElement('div');
    answerGroup.classList.add('answer-group', 'mb-3', 'input-group');

    const tempId = answerId || 'new-' + Math.random().toString(36).substr(2, 9); // Generate a temporary ID if not provided
    answerGroup.dataset.answerId = tempId; // Set the data-answer-id attribute

    const answerText = document.createElement('input');
    answerText.type = 'text';
    answerText.classList.add('form-control', 'answer-text');
    answerText.value = text;
    answerText.placeholder = `Answer ${document.querySelectorAll('.answer-group').length + 1}`; // Placeholder for input

    const answerCorrect = document.createElement('input');
    answerCorrect.type = 'checkbox';
    answerCorrect.classList.add('form-check-input', 'answer-correct');
    answerCorrect.checked = isCorrect; // Set checkbox status based on isCorrect
    answerCorrect.addEventListener('change', () => {
        document.querySelectorAll('.answer-correct').forEach(checkbox => {
            checkbox.checked = false; // Uncheck all other checkboxes
        });
        answerCorrect.checked = true; // Check the current checkbox
        showExplanation(answerGroup, explanation); // Show explanation for the selected answer
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.classList.add('btn', 'btn-danger', 'ms-2');
    deleteButton.innerHTML = '<i class="bi bi-trash"></i>'; // Set button icon
    deleteButton.addEventListener('click', async () => {
        const confirmed = confirm('Are you sure you want to delete this answer?'); // Confirm deletion
        if (confirmed) {
            await deleteAnswer(tempId); // Call deleteAnswer function
        }
    });

    const inputGroupAppend = document.createElement('div');
    inputGroupAppend.classList.add('input-group-append');
    inputGroupAppend.appendChild(answerCorrect); // Append checkbox
    inputGroupAppend.appendChild(deleteButton); // Append delete button

    answerGroup.appendChild(answerText); // Append answer text input
    answerGroup.appendChild(inputGroupAppend); // Append input group

    const explanationText = document.createElement('input');
    explanationText.type = 'text';
    explanationText.classList.add('form-control', 'answer-explanation');
    explanationText.value = explanation; // Set explanation value
    explanationText.placeholder = 'Explanation for the correct answer'; // Placeholder for input
    explanationText.style.display = isCorrect ? 'block' : 'none'; // Show explanation only if answer is correct

    answerGroup.appendChild(explanationText); // Append explanation input

    document.getElementById('editAnswersContainer').appendChild(answerGroup); // Add answer group to the container
}

// Function to show explanation input for the selected answer
function showExplanation(answerGroup, explanation = '') {
    document.querySelectorAll('.answer-explanation').forEach(input => {
        input.style.display = 'none'; // Hide all explanation inputs
    });
    const explanationInput = answerGroup.querySelector('.answer-explanation');
    if (explanationInput) {
        explanationInput.style.display = 'block'; // Show explanation input for the current answer
        explanationInput.value = explanation; // Set the explanation value
    }
}

// Event listener for the "Add Answer" button
const addAnswerButton = document.getElementById('add-answer');
addAnswerButton.addEventListener('click', () => {
    addAnswer('', false); // Add a new answer group with default values
});

// Event listener for the form submission
const editAnswersForm = document.getElementById('edit-answers-form1');
editAnswersForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    const questionId = new URLSearchParams(window.location.search).get('id') || '1'; // Get question ID from URL
    const token = sessionStorage.getItem('token');
    const answers = Array.from(document.querySelectorAll('.answer-group')).map(group => {
        return {
            id: group.dataset.answerId, // Include the answer ID
            answer_text: group.querySelector('input[type="text"]').value,
            is_correct: group.querySelector('input[type="checkbox"]').checked ? 1 : 0,
            explanation: group.querySelector('.answer-explanation').value || null
        };
    });

    console.log(answers);

    // Validation: Ensure there is exactly one correct answer
    if (!answers.some(answer => answer.is_correct)) {
        alert('There must be at least one correct answer.');
        return;
    }

    if (answers.filter(answer => answer.is_correct).length > 1) {
        alert('Only one answer can be marked as correct.');
        return;
    }

    try {
        for (const answer of answers) {
            let method = answer.id.startsWith('new-') ? 'POST' : 'PUT'; // Determine method based on whether the answer is new or existing
            let url = answer.id.startsWith('new-') ? `/quiz/answers/` : `/quiz/answers/${answer.id}/`; // Set URL based on method
    
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Send the token in the Authorization header
                },
                body: JSON.stringify({
                    question_id: questionId, // Ensure this field is correct
                    answer_text: answer.answer_text,
                    is_correct: answer.is_correct,
                    explanation: answer.explanation
                })
            });
    
            if (!response.ok) {
                const errorData = await response.json(); // Get the error message from the server
                throw new Error(`Failed to save changes: ${errorData.message}`); // Throw error with message
            }
    
            const responseData = await response.json();
            console.log('Response:', responseData);
    
            // Update the dataset answer ID for new answers
            if (method === 'POST') {
                const answerGroup = document.querySelector(`[data-answer-id="${answer.id}"]`);
                if (answerGroup) {
                    answerGroup.dataset.answerId = responseData.id; // Update the ID for newly created answers
                }
            }
        }
    
        alert('Answers updated successfully!');
        window.location.reload(); // Reload the page to reflect changes
    } catch (error) {
        console.error('Error saving changes:', error);
        alert('Error saving changes:', error.message); // Show specific error message
    }
});

// Function to delete an answer based on its ID
async function deleteAnswer(answerId) {
    if (!answerId) {
        // If the answerId is null, it's a new answer that hasn't been saved yet, just remove it from the DOM
        return document.querySelector(`[data-answer-id="${answerId}"]`).remove(); // Remove answer group from the DOM
    }

    const token = sessionStorage.getItem('token');
    try {
        const response = await fetch(`/quiz/answers/${answerId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                alert('Answer not found.'); // Alert if the answer is not found
            } else {
                throw new Error('Failed to delete answer'); // Throw error for other failures
            }
        } else {
            alert('Answer deleted successfully!');
            window.location.reload(); // Reload the page to reflect changes
        }
    } catch (error) {
        console.error('Error deleting answer:', error);
        alert('Error deleting answer'); // Show specific error message
    }
}
