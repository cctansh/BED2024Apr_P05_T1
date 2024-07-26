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


/* add a new question
function addQuestion(text = ''){
    const questionText = document.createElement('input');
    questionText.type = 'text';
    questionText.classList.add('form-control', 'question-text');
    questionText.value = text;
    questionText.placeholder = `Question ${document.querySelectorAll('.question-group').length + 1}`;

}*/

async function createQuizQuestion(newQuestion) {
    const token = sessionStorage.getItem('token');
    try {
        const response = await fetch('/quiz/questions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newQuestion)
        });

        if (!response.ok) {
            throw new Error('Failed to add question');
        } else {
            alert('Question added successfully!');
            window.location.reload();
        }
    } catch (error) {
        console.error('Error adding question:', error);
        alert('Error adding question');
    }
}

// update the question
async function updateQuestion(questionId, questionData) {
    const token = sessionStorage.getItem('token');
    try {
        const response = await fetch(`/quiz/questions/${questionId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(questionData)
        });

        if (!response.ok) {
            throw new Error('Failed to update question');
        } else {
            alert('Question updated successfully!');
            window.location.reload();
        }
    } catch (error) {
        console.error('Error updating question:', error);
        alert('Error updating question');
    }
}





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
