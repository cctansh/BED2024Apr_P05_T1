// Retrieve necessary elements
const token = sessionStorage.getItem('token'); // Retrieve token from session storage
const loginProfileLink = document.getElementById('login-profile-link'); // Retrieve profile link element
const loginAccId = sessionStorage.getItem('loginAccId'); // Retrieve logged-in account ID from session storage
const loginAccRole = sessionStorage.getItem('loginAccRole'); // Retrieve logged-in account role from session storage
const rToken = getCookie('rToken');

if (token && !isTokenExpired(token)) {
    loginProfileLink.innerHTML = `Profile`;
    loginProfileLink.setAttribute("href", `profile.html?id=${loginAccId}`)
} else if (rToken) {
    refreshToken(rToken);
} else {
    sessionStorage.clear();
    window.location.href = `/index.html`;
}

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
        console.log("error");
        alert('Login timed out.');
        sessionStorage.clear();
        deleteCookie('rToken');
        window.location.href = `/index.html`;
    }
}

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
            populateQuestionsTable(questions);
        } else {
            console.error('Unexpected response format:', questions);
        }
    } catch (error) {
        console.error('Error fetching questions:', error);
    }
}

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
                        // If confirmed, delete the reply
                        await deleteQuestion(question.id);
                    } catch (error) {
                        // If failed to delete reply, log the error in console and alert user that reply deletion failed
                        console.error("Failed to delete question:", error);
                        alert('Failed to delete question.');
                    }
                }
            });

    });
}


// delete the question
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


// UNTIL HERE THE CODE IS PERFECT!! PLEASE DO NOT TOUCH ANYTHING ABOVE



// Edit question goes below

document.addEventListener('DOMContentLoaded', () => {
    const addQuestionButton = document.getElementById('add-question');
    const editQuestionForm = document.getElementById('edit-question-form');
    const questionsTableBody = document.getElementById('questions-tbody');

    // Redirect to a new page for adding a question
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
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch questions');
            }

            const questions = await response.json();
            displayQuestions(questions);
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
                question: group.querySelector('input[type="text"]').value
            };
        });

        console.log(questions);

        // Validation: Ensure there is at least one question
        if (questions.length === 0) {
            alert('There must be at least one question.');
            return;
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




window.viewQuestion = function (id) {
    window.location.href = `/quizquestion.html?id=${id}`;
};

window.editQuestion = function (id) {
    window.location.href = `/editanswer.html?id=${id}`;
};

window.goBack = function () {
    window.history.back();
};

document.addEventListener('DOMContentLoaded', async function () {
    await loadQuestions();
});

document.addEventListener('DOMContentLoaded', () => {
    const editQuestionButton = document.getElementById('edit-question');

    // Redirect to the addQuestionScreen.html page when the button is clicked
    editQuestionButton.addEventListener('click', () => {
        window.location.href = 'addQuestionScreen.html'; // Adjust the URL as needed
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const goBackButton = document.getElementById('add-question');

    // Redirect to editquiz.html when the button is clicked
    goBackButton.addEventListener('click', () => {
        window.location.href = 'editquiz.html'; // Adjust the URL if necessary
    });
});

