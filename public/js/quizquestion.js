// Selection of DOM elements that will be manipulated
const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const explanationElement = document.getElementById("explanation");
const explanationText = document.getElementById("explanation-text");

// Variables to track current question index and user score
let currentQuestionIndex = 0;
let score = 0;
let questions = [];

// Function to start the quiz
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = "NEXT";
    fetchQuestions();
}

// Fetch questions from the server
async function fetchQuestions() {
    try {
        const response = await fetch('/quiz/questions');
        questions = await response.json();
        showQuestion();
    } catch (error) {
        console.error('Error fetching questions:', error);
    }
}

// Shows the current question and its answers
function showQuestion() {
    resetState(); // Clear any previous question's state
    const currentQuestion = questions[currentQuestionIndex];
    const questionNo = currentQuestionIndex + 1;
    questionElement.innerHTML = questionNo + ". " + currentQuestion.question;

    // Check if there's an image for the current question
    if (currentQuestion.image_path) {
        const imageElement = document.createElement("img");
        imageElement.src = currentQuestion.image_path;
        imageElement.classList.add("question-image");
        questionElement.appendChild(imageElement);
    }

    // Create buttons for each answer option
    currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.innerHTML = answer.answer_text;
        button.classList.add("btn");
        answerButtons.appendChild(button);
        if (answer.is_correct) {
            button.dataset.correct = answer.is_correct;
        }
        button.addEventListener("click", selectAnswer);
    });
}

// Function to reset quiz state to default Q1
function resetState() {
    nextButton.style.display = "none"; // Hide next button

    while (answerButtons.firstChild) { // Remove previous answers
        answerButtons.removeChild(answerButtons.firstChild);
    }
}

// Function to handle user answer selection
function selectAnswer(e) {
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct === "true";
    if (isCorrect) {
        selectedBtn.classList.add("correct");
        score++;
    } else {
        selectedBtn.classList.add("incorrect");
    }

    const explanationText = document.createElement("p");
    explanationText.classList.add("explanation");
    explanationText.innerText = questions[currentQuestionIndex].explanation;
    selectedBtn.after(explanationText);

    // Disable all buttons and highlight correct answer
    Array.from(answerButtons.children).forEach(button => {
        if (button.dataset.correct === "true") {
            button.classList.add("correct");
        }
        button.disabled = true;
    });

    // Display next button
    nextButton.style.display = "block";
}

// Displays the final score and calculates a discount
function showScore() {
    resetState();
    questionElement.innerHTML = `You scored ${score} out of ${questions.length}!`;
    // Update next button for completion
    nextButton.innerHTML = "DONE";
    nextButton.style.display = "block";
}

// Controls the flow when the next button is clicked
function handleNextButton() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) { // If questions still remaining
        showQuestion();
    } else { // End quiz and show score
        showScore();
    }
}

// Acts when clicking next button
nextButton.addEventListener("click", () => {
    if (currentQuestionIndex < questions.length) { // If questions still remaining
        handleNextButton();
    } else {
        // Navigate to index.html only when patch is successful
        window.location.href = 'index.html';
    }
});

// Start the quiz when the page loads
startQuiz();
