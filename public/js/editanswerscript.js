document.addEventListener('DOMContentLoaded', async function () {
    console.log('DOM fully loaded and parsed');
    await loadQuestionAndAnswers();
});

function goBack() {
    window.history.back();
}

const token = sessionStorage.getItem('token');
const loginProfileLink = document.getElementById('login-profile-link');
const loginAccId = sessionStorage.getItem('loginAccId');
const loginAccRole = sessionStorage.getItem('loginAccRole');
const rToken = getCookie('rToken');

if (token && !isTokenExpired(token)) {
    loginProfileLink.innerHTML = `Profile`;
    loginProfileLink.setAttribute("href", `profile.html?id=${loginAccId}`);
} else if (rToken) {
    refreshToken(rToken);
} else {
    sessionStorage.clear();
    window.location.href = `/index.html`;
}

function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000;
    return Date.now() > expiry;
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

async function loadQuestionAndAnswers() {
    const questionId = new URLSearchParams(window.location.search).get('id') || '1';
    const token = sessionStorage.getItem('token');

    try {
        const questionResponse = await fetch(`/quiz/questions/${questionId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!questionResponse.ok) {
            throw new Error('Failed to fetch question data');
        }

        const questionData = await questionResponse.json();
        console.log('Fetched question data:', questionData);

        document.getElementById('questionText').innerText = questionData.question;

        const answersResponse = await fetch(`/quiz/answers/${questionId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!answersResponse.ok) {
            throw new Error('Failed to fetch answers data');
        }

        const answersData = await answersResponse.json();
        console.log('Fetched answers data:', answersData);

        const answersContainer = document.getElementById('editAnswersContainer');
        answersContainer.innerHTML = '';

        answersData.forEach(answer => {
            addAnswer(answer.answer_text, answer.is_correct, answer.id, answer.explanation);
        });
    } catch (error) {
        console.error('Error fetching question or answers data:', error);
    }
}

function addAnswer(text = '', isCorrect = false, answerId = null, explanation = '') {
    const answerGroup = document.createElement('div');
    answerGroup.classList.add('answer-group', 'mb-3', 'input-group');

    const tempId = answerId || 'new-' + Math.random().toString(36).substr(2, 9);
    answerGroup.dataset.answerId = tempId;

    const answerText = document.createElement('input');
    answerText.type = 'text';
    answerText.classList.add('form-control', 'answer-text');
    answerText.value = text;
    answerText.placeholder = `Answer ${document.querySelectorAll('.answer-group').length + 1}`;

    const answerCorrect = document.createElement('input');
    answerCorrect.type = 'checkbox';
    answerCorrect.classList.add('form-check-input', 'answer-correct');
    answerCorrect.checked = isCorrect;
    answerCorrect.addEventListener('change', () => {
        document.querySelectorAll('.answer-correct').forEach(checkbox => {
            checkbox.checked = false;
        });
        answerCorrect.checked = true;
        showExplanation(answerGroup, explanation);
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.classList.add('btn', 'btn-danger', 'ms-2');
    deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
    deleteButton.addEventListener('click', async () => {
        const confirmed = confirm('Are you sure you want to delete this answer?');
        if (confirmed) {
            await deleteAnswer(tempId);
        }
    });

    const inputGroupAppend = document.createElement('div');
    inputGroupAppend.classList.add('input-group-append');
    inputGroupAppend.appendChild(answerCorrect);
    inputGroupAppend.appendChild(deleteButton);

    answerGroup.appendChild(answerText);
    answerGroup.appendChild(inputGroupAppend);
    
    const explanationText = document.createElement('input');
    explanationText.type = 'text';
    explanationText.classList.add('form-control', 'answer-explanation');
    explanationText.value = explanation;
    explanationText.placeholder = 'Explanation for the correct answer';
    explanationText.style.display = isCorrect ? 'block' : 'none';

    answerGroup.appendChild(explanationText);

    document.getElementById('editAnswersContainer').appendChild(answerGroup);
}

function showExplanation(answerGroup, explanation = '') {
    document.querySelectorAll('.answer-explanation').forEach(input => {
        input.style.display = 'none';
    });
    const explanationInput = answerGroup.querySelector('.answer-explanation');
    if (explanationInput) {
        explanationInput.style.display = 'block';
        explanationInput.value = explanation;
    }
}


const addAnswerButton = document.getElementById('add-answer');
const editAnswersForm = document.getElementById('edit-answers-form1');

addAnswerButton.addEventListener('click', () => {
    addAnswer('', false);
});

editAnswersForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const questionId = new URLSearchParams(window.location.search).get('id') || '1';
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
            let method = answer.id.startsWith('new-') ? 'POST' : 'PUT';
            let url = answer.id.startsWith('new-') ? `/quiz/answers/` : `/quiz/answers/${answer.id}/`;
    
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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
                throw new Error(`Failed to save changes: ${errorData.message}`);
            }
    
            const responseData = await response.json();
            console.log('Response:', responseData);
    
            // Update the dataset answer ID for new answers
            if (method === 'POST') {
                const answerGroup = document.querySelector(`[data-answer-id="${answer.id}"]`);
                if (answerGroup) {
                    answerGroup.dataset.answerId = responseData.id;
                }
            }
        }
    
        alert('Answers updated successfully!');
        window.location.reload();
    } catch (error) {
        console.error('Error saving changes:', error);
        alert('Error saving changes:', error.message); // Show specific error message
    }
});

async function deleteAnswer(answerId) {
    if (!answerId) {
        // If the answerId is null, it's a new answer that hasn't been saved yet, just remove it from the DOM
        return document.querySelector(`[data-answer-id="${answerId}"]`).remove();
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
                alert('Answer not found.');
            } else {
                throw new Error('Failed to delete answer');
            }
        } else {
            alert('Answer deleted successfully!');
            window.location.reload();
        }
    } catch (error) {
        console.error('Error deleting answer:', error);
        alert('Error deleting answer');
    }
}