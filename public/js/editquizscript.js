// Retrieve necessary elements
const token = sessionStorage.getItem('token'); // Retrieve token from session storage
const loginProfileLink = document.getElementById('login-profile-link'); // Retrieve profile link element
const loginAccId = sessionStorage.getItem('loginAccId'); // Retrieve logged-in account ID from session storage
const loginAccRole = sessionStorage.getItem('loginAccRole'); // Retrieve logged-in account role from session storage
const rToken = getCookie('rToken'); // Retrieve refresh token from cookies

// Check if token exists and is not expired
if (token && !isTokenExpired(token)) {
    loginProfileLink.innerHTML = `Profile`;
    loginProfileLink.setAttribute("href", `profile.html?id=${loginAccId}`)
} else if (rToken) {
    refreshToken(rToken); // If token is expired but refresh token exists, refresh the token
} else {
    sessionStorage.clear(); // Clear session storage if no valid tokens exist
    window.location.href = `/index.html`; // Redirect to index page
}

// Function to check if the JWT token is expired
function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the token payload
    const expiry = payload.exp * 1000; // Convert expiry time to milliseconds
    return Date.now() > expiry; // Check if the current time is past the expiry time
}

// Function to parse JWT token
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

// Function to get a cookie by name
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
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

// Function to refresh the JWT token using the refresh token
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

        location.reload(); // Reload the page to apply the new token
    } catch {
        console.log("error");
        alert('Login timed out.');
        sessionStorage.clear();
        deleteCookie('rToken');
        window.location.href = `/index.html`;
    }
}

// Function to load questions from the server
async function loadQuestions() {
    try {
        const response = await fetch('/quiz/questions', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch questions');
        }

        const questions = await response.json();
        console.log("Questions: ", questions); // Log the questions received

        if (Array.isArray(questions)) {
            populateQuestionsTable(questions); // Populate the table with questions
        } else {
            console.error('Unexpected response format:', questions);
        }
    } catch (error) {
        console.error('Error fetching questions:', error);
    }
}

// Function to populate the questions table
function populateQuestionsTable(questions) {
    const tableBody = document.getElementById('questions-table-body');
    tableBody.innerHTML = '';
    questions.forEach((question, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td onclick="viewQuestion(${question.id})">${question.question}</td>
            <td><button class="btn btn-primary" onclick="editQuestion(${question.id})"><i class="bi bi-pencil-fill"></i></button></td>
            <td><button class="btn btn-danger delete-question"><i class="bi bi-trash3"></i></button></td>
        `;
        tableBody.appendChild(row);

        const deleteQuestionButton = row.querySelector('.delete-question');
            deleteQuestionButton.addEventListener('click', async () => {
                // If click delete reply button, ask user if they confirm want to delete the question
                const confirmed = confirm("Are you sure you want to delete this question?");
                if (confirmed) {
                    try {
                        // If confirmed, delete the question
                        await deleteQuestion(question.id);
                    } catch (error) {
                        // If failed to delete question, log the error in console and alert user that question deletion failed
                        console.error("Failed to delete question:", error);
                        alert('Failed to delete question.');
                    }
                }
            });

    });
}

// Function to delete a question
async function deleteQuestion(questionId) {
    console.log(questionId);
    if(!questionId) {
        // question id not found
        return document.querySelector(`[data-answer-id="${questionId}"]`).remove();
    }

    try {
        const response = await fetch(`/quiz/questions/${questionId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                alert('Question not found.');
            } else {
                throw new Error('Failed to delete Question');
            }
        } else {
            alert('Question deleted successfully!');
            window.location.reload();
        }
    } catch (error) {
        console.error('Error deleting question:', error);
        alert('Error deleting question');
    }
} 


// Code to edit quiz questions

document.addEventListener('DOMContentLoaded', () => {
    const addQuestionButton = document.getElementById('add-question');
    const editQuestionForm = document.getElementById('edit-question-form');
    const questionsTableBody = document.getElementById('questions-tbody');

    // Add a new question row
    addQuestionButton.addEventListener('click', () => {
        const newQuestionRow = document.createElement('tr');
        newQuestionRow.classList.add('question-group');
        newQuestionRow.dataset.questionId = `new-${Date.now()}`;
        newQuestionRow.innerHTML = `
            <td>
                <input type="text" placeholder="Enter new question" class="form-control" />
            </td>
            <td>
                <button type="button" class="btn btn-primary save-question">Save</button>
            </td>
        `;
        questionsTableBody.appendChild(newQuestionRow);
    });

    // Fetch and display existing questions
    async function fetchQuestions() {
        try {
            const response = await fetch('/quiz/questions', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch questions');
            }

            const questions = await response.json();
            displayQuestions(questions); // Display the fetched questions
        } catch (error) {
            console.error('Error fetching questions:', error);
            alert('Error fetching questions');
        }
    }

    // Function to display questions in the table
    function displayQuestions(questions) {
        questionsTableBody.innerHTML = ''; // Clear existing content
        questions.forEach(question => {
            const row = document.createElement('tr');
            row.classList.add('question-group');
            row.dataset.questionId = question.id;

            row.innerHTML = `
                <td>
                    <input type="text" value="${question.question}" class="form-control" />
                </td>
                <td>
                    <button type="button" class="btn btn-primary save-question">Save</button>
                </td>
            `;

            questionsTableBody.appendChild(row);
        });
    }

    // Handle form submission for editing existing questions
    editQuestionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const quizId = new URLSearchParams(window.location.search).get('quizId') || '1';
        const token = sessionStorage.getItem('token');
        const questions = Array.from(document.querySelectorAll('.question-group')).map(group => {
            return {
                id: group.dataset.questionId,
                question: group.querySelector('input[type="text"]').value.trim()
            };
        });

        console.log(questions);

        // Validation: Ensure there is at least one question
        if (questions.length === 0) {
            alert('There must be at least one question.');
            return;
        }

        // Validation: Ensure each question has characters
        for (const question of questions) {
            if (!question.question) {
                alert('All questions must contain characters.');
                return;
            }
        }

        try {
            for (const question of questions) {
                let method = question.id.startsWith('new-') ? 'POST' : 'PUT';
                let url = question.id.startsWith('new-') ? `/quiz/questions/` : `/quiz/questions/${question.id}/`;

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        quiz_id: quizId, // Ensure this field is correct
                        question: question.question
                    })
                });

                if (!response.ok) {
                    const errorData = await response.text(); // Get the error message from the server as text
                    throw new Error(`Failed to save changes: ${errorData}`);
                }

                const responseData = await response.json();
                console.log('Response:', responseData);

                // Update the dataset question ID for new questions
                if (method === 'POST') {
                    const questionGroup = document.querySelector(`[data-question-id="${question.id}"]`);
                    if (questionGroup) {
                        questionGroup.dataset.questionId = responseData.id;
                    }
                }
            }

            alert('Questions updated successfully!');
            window.location.reload();
        } catch (error) {
            console.error('Error saving changes:', error);
            alert(`Error saving changes: ${error.message}`);
        }
    });

    // Initial fetch of questions
    fetchQuestions();
});

// Define functions for viewing and editing questions

// Redirect to quizquestion.html with the question ID
window.viewQuestion = function (id) {
    window.location.href = `/quizquestion.html?id=${id}`;
};

// Redirect to editanswer.html with the question ID
window.editQuestion = function (id) {
    window.location.href = `/editanswer.html?id=${id}`;
};

// Load questions when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async function () {
    await loadQuestions();
});

// Redirect to addQuestionScreen.html when the edit button is clicked
document.addEventListener('DOMContentLoaded', () => {
    const editQuestionButton = document.getElementById('editing-question');

    // Redirect to the addQuestionScreen.html page when the button is clicked
    editQuestionButton.addEventListener('click', () => {
        window.location.href = 'addQuestionScreen.html'; // Adjust the URL as needed
    });
});

// Redirect to editquiz.html when the go back button is clicked
document.addEventListener('DOMContentLoaded', () => {
    const goBackButton = document.getElementById('go-back');

    // Redirect to editquiz.html when the button is clicked
    goBackButton.addEventListener('click', () => {
        window.location.href = 'editquiz.html'; // Adjust the URL if necessary
    });
});

// Function to go back to the quiz question page
function goBack() {
    window.location.href = 'quizquestion.html';
}

