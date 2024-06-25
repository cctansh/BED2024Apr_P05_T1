/*
This script handles:

Fetching the quiz question and answers
Editing answers
Adding new answers
Deleting answers
Marking an answer as correct
*/

document.addEventListener('DOMContentLoaded', function () {
    const questionElement = document.getElementById('question');
    const answerButtons = document.getElementById('answer-buttons');
    const imageUpload = document.getElementById('image-upload');
    const editQuestionButton = document.getElementById('add-reply');
    const correctAnswerCheckboxes = document.querySelectorAll('.correct-answer-checkbox');
    let currentQuestion = {};
    let answers = [];

    // Fetch quiz data (replace '1' with the actual question ID)
    fetch('/api/quiz/1')
        .then(response => response.json())
        .then(data => {
            currentQuestion = data.question;
            answers = data.answers;
            displayQuestion();
            displayAnswers();
        })
        .catch(error => console.error('Error:', error));

    function displayQuestion() {
        questionElement.innerText = `Question: ${currentQuestion.question}`;
        if (currentQuestion.image_path) {
            const img = document.createElement('img');
            img.src = currentQuestion.image_path;
            questionElement.appendChild(img);
        }
    }

    function displayAnswers() {
        answerButtons.innerHTML = '';
        answers.forEach(answer => {
            const answerButton = document.createElement('button');
            answerButton.classList.add('btn');
            answerButton.innerText = answer.answer_text;
            answerButton.dataset.id = answer.id;
            answerButton.addEventListener('click', () => editCorrectAnswer(answer.id));
            answerButtons.appendChild(answerButton);

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('correct-answer-checkbox');
            checkbox.checked = answer.is_correct;
            checkbox.addEventListener('change', () => markCorrectAnswer(answer.id));
            answerButton.appendChild(checkbox);

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-answer-button');
            deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
            deleteButton.addEventListener('click', () => deleteAnswer(answer.id));
            answerButton.appendChild(deleteButton);
        });

        const addButton = document.createElement('button');
        addButton.classList.add('btn');
        addButton.innerText = 'Add Answer';
        addButton.addEventListener('click', addAnswer);
        answerButtons.appendChild(addButton);
    }

    function markCorrectAnswer(answerId) {
        answers.forEach(answer => {
            if (answer.id === answerId) {
                answer.is_correct = true;
            } else {
                answer.is_correct = false;
            }
        });
        displayAnswers();
    }

    function addAnswer() {
        const newAnswer = { answer_text: 'New Answer', is_correct: false, question_id: currentQuestion.id };
        answers.push(newAnswer);
        displayAnswers();
    }

    function deleteAnswer(answerId) {
        answers = answers.filter(answer => answer.id !== answerId);
        displayAnswers();
    }

    function editCorrectAnswer(answerId) {
        // Redirect to the Edit Correct Answer page
        window.location.href = `editcorrectanswer.html?answerId=${answerId}`;
    }

    editQuestionButton.addEventListener('click', () => {
        // Save changes and redirect to the Confirm Edit Answers page
        fetch(`/api/quiz/${currentQuestion.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question: currentQuestion, answers: answers })
        })
            .then(response => response.json())
            .then(data => {
                window.location.href = 'confirmeditanswers.html';
            })
            .catch(error => console.error('Error:', error));
    });
});
