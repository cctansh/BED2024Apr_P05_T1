// Retrieve necessary elements
const token = sessionStorage.getItem('token'); // Retrieve token from session storage
const loginProfileLink = document.getElementById('login-profile-link'); // Retrieve profile link element
const loginAccId = sessionStorage.getItem('loginAccId'); // Retrieve logged-in account ID from session storage
const loginAccRole = sessionStorage.getItem('loginAccRole'); // Retrieve logged-in account role from session storage
const rToken = getCookie('rToken');

if (token && !isTokenExpired(token)) {
    loginProfileLink.innerHTML = `Profile&ensp;<i class="bi bi-person-fill"></i>`;
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

document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM fully loaded and parsed');
    await loadQuestionAndAnswers();
});

async function loadQuestionAndAnswers() {
    const questionId = new URLSearchParams(window.location.search).get('id') || '1';
    const token = sessionStorage.getItem('token');

    try {
        const response = await fetch(`/quiz/questions/${questionId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch question data');
        }

        const data = await response.json();
        console.log('Fetched question data:', data);

        document.getElementById('questionText').innerText = data.question;

        const answersContainer = document.getElementById('answersContainer');
        answersContainer.innerHTML = '';

        data.answers.forEach(answer => {
            addAnswer(answer.text, answer.isCorrect);
        });
    } catch (error) {
        console.error('Error fetching question data:', error);
    }
}

const answersContainer = document.getElementById('answersContainer');
const addAnswerButton = document.getElementById('add-answer');
const editAnswersForm = document.getElementById('edit-answers-form');

addAnswerButton.addEventListener('click', () => {
    addAnswer('', false);
});

editAnswersForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const questionId = new URLSearchParams(window.location.search).get('id') || '1';
    const token = sessionStorage.getItem('token');
    const answers = Array.from(document.querySelectorAll('.answer-group')).map(group => {
        return {
            text: group.querySelector('input[type="text"]').value,
            isCorrect: group.querySelector('input[type="checkbox"]').checked
        };
    });

    if (!answers.some(answer => answer.isCorrect)) {
        alert('There must be at least one correct answer.');
        return;
    }

    try {
        const response = await fetch(`/quiz/answers/${questionId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ answers })
        });

        if (!response.ok) {
            throw new Error('Failed to save changes');
        }

        alert('Answers updated successfully!');
        window.location.reload();
    } catch (error) {
        console.error('Error saving changes:', error);
    }
});

function addAnswer(text = '', isCorrect = false) {
    const answerGroup = document.createElement('div');
    answerGroup.classList.add('answer-group', 'mb-3', 'input-group');

    const answerText = document.createElement('input');
    answerText.type = 'text';
    answerText.classList.add('form-control', 'answer-text');
    answerText.value = text;
    answerText.placeholder = `Answer ${document.querySelectorAll('.answer-group').length + 1}`;

    const answerCorrect = document.createElement('input');
    answerCorrect.type = 'checkbox';
    answerCorrect.classList.add('form-check-input', 'answer-correct');
    answerCorrect.checked = isCorrect;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.classList.add('btn', 'btn-danger', 'ms-2');
    deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
    deleteButton.addEventListener('click', () => {
        answersContainer.removeChild(answerGroup);
    });

    const inputGroupAppend = document.createElement('div');
    inputGroupAppend.classList.add('input-group-append');
    inputGroupAppend.appendChild(answerCorrect);
    inputGroupAppend.appendChild(deleteButton);

    answerGroup.appendChild(answerText);
    answerGroup.appendChild(inputGroupAppend);
    answersContainer.appendChild(answerGroup);
}

