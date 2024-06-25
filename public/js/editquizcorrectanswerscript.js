// This script handles:
//Editing the answer text and explanation

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const answerId = urlParams.get('answerId');
    const answerTextElement = document.getElementById('newpostcontent');
    const editAnswerButton = document.getElementById('add-reply');
    let currentAnswer = {};

    // Fetch answer data
    fetch(`/api/answer/${answerId}`)
        .then(response => response.json())
        .then(data => {
            currentAnswer = data;
            answerTextElement.value = currentAnswer.answer_text;
        })
        .catch(error => console.error('Error:', error));

    editAnswerButton.addEventListener('click', () => {
        currentAnswer.answer_text = answerTextElement.value;

        fetch(`/api/answer/${currentAnswer.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(currentAnswer)
        })
            .then(response => response.json())
            .then(data => {
                window.location.href = 'confirmeditanswers.html';
            })
            .catch(error => console.error('Error:', error));
    });
});
