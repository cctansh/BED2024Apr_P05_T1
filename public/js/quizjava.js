// Array of quiz questions with options and correct answers
const questions = [
    // Each object in the array represents a quiz question
    // Q1
    {
        question:  "What is the Singaporean government's '30 by 30' goal for food security?",
        image: "img/30by30.png",
        answers: [
            { "text": "To produce 30% of Singapore's nutritional needs locally by 2030", "correct": true },
            { "text": "To reduce food imports by 30% by 2030", "correct": false },
            { "text": "To increase food exports by 30% by 2030", "correct": false },
            { "text": "To invest 30% of the national budget in agriculture by 2030", "correct": false }

        ],
        explanation: "The '30 by 30' goal aims for Singapore to produce 30% of its nutritional needs locally by 2030 to enhance food security."
    },
    // Q2
    {
        question:  "How is Singapore addressing the challenge of limited land space for agriculture?",
        image: "img/urbanfarmrooftop.png",
        answers: [
            { text: "By reclaiming land from the sea for farming", correct: false},
            { text: "By importing all its food needs", correct: false},
            { text: "By investing in vertical farming and rooftop gardens", correct: true},
            { text: "By reducing the population to lower food demand", correct: false},

        ],
        explanation: "Singapore is investing in vertical farming and rooftop gardens to maximize the use of limited land space for agriculture."
    },
    // Q3
    {
        question:  "Which of the following is a key component of Singapore's food security strategy?",
        image: "img/diversefood.png",
        answers: [
            { text: "Relying heavily on neighboring countries for food", correct: false},
            { text: "Encouraging a monoculture farming approach", correct: false},
            { text: "Limiting technological advancements in agriculture", correct: false},
            { text: "Diversifying its food sources and suppliers", correct: true},

        ],
        explanation: "Diversifying food sources and suppliers is a key component of Singapore's food security strategy to mitigate risks."
    },
    // Q4
    {
        question:  "What role does the Singapore Food Agency (SFA) play in ensuring food security?",
        answers: [
            { text: "Regulating food imports and exports", correct: false},
            { text: "Supporting local food production", correct: false},
            { text: "Ensuring food safety and quality", correct: false},
            { text: "All of the above", correct: true},


        ],
        explanation: "The Singapore Food Agency (SFA) plays a comprehensive role including regulating imports/exports, supporting local production, and ensuring food safety and quality."
    },
    // Q5
    {
        question:  "What is one way that Singapore can reduce its reliance on food imports?",
        answers: [
            { text: "Banning all imported food products", correct: false},
            { text: "Increasing public awareness about food waste reduction", correct: true},
            { text: "Closing all restaurants that serve foreign cuisine", correct: false},
            { text: "Restricting the use of fertilizers", correct: false},

        ],
        explanation: "Increasing public awareness about food waste reduction can help Singapore reduce its reliance on food imports."
    },

];

// Selection of DOM elements that will be manipulated
const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const questionImage = document.getElementById("question-image");
const explanationElement = document.getElementById("explanation");
const explanationText = document.getElementById("explanation-text");

// Variables to track current question index and user score
let currentQuestionIndex = 0;
let score = 0;

// Function to start the quiz
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = "NEXT";
    showQuestion();
}

// Shows the current question and its answers
function showQuestion(){
    resetState(); // Clear any previous question's state
    let currentQuestion = questions[currentQuestionIndex];
    let questionNo = currentQuestionIndex + 1;
    questionElement.innerHTML = questionNo + ". " + currentQuestion.question;

    // Check if there's an image for the current question
    if (currentQuestion.image) {
        const imageElement = document.createElement("img");
        imageElement.src = currentQuestion.image;
        imageElement.classList.add("question-image"); 
        questionElement.appendChild(imageElement); // Append image to the question element
    }

    // Create buttons for each answer option
    currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.innerHTML = answer.text;
        button.classList.add("btn");
        answerButtons.appendChild(button);
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener("click", selectAnswer);

    });

}

// Function to reset quiz state to default Q1
function resetState(){
    nextButton.style.display = "none"; // Hide next button
    
    while(answerButtons.firstChild){ // Remove previous answers
        answerButtons.removeChild(answerButtons.firstChild);
    }
}

// Function to handle user answer selection
function selectAnswer(e){
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct === "true";
    if(isCorrect){
        selectedBtn.classList.add("correct");
        score++;
    }else{
        selectedBtn.classList.add("incorrect");
    }

    const explanationText = document.createElement("p");
    explanationText.classList.add("explanation");
    explanationText.innerText = questions[currentQuestionIndex].explanation;
    selectedBtn.after(explanationText);


    // Disable all buttons and highlight correct answer
    Array.from(answerButtons.children).forEach(button => {
        if(button.dataset.correct === "true"){
            button.classList.add("correct");
        }
        button.disabled = true;
    });

    // Display next button
    nextButton.style.display = "block";
}

// Displays the final score and calculates a discount
function showScore(){
    resetState();
    questionElement.innerHTML = `You scored ${score} out of ${questions.length}!`;
    // Update next button for completion
    nextButton.innerHTML = "DONE";
    nextButton.style.display = "block";
}

// Controls the flow when the next button is clicked
function handleNextButton(){
    currentQuestionIndex++;
    if(currentQuestionIndex < questions.length){ // If questions still remaining
        showQuestion();
    }else{ // End quiz and show score
        showScore();
    }
}

// Acts when clicking next button
nextButton.addEventListener("click", ()=>{
    if(currentQuestionIndex < questions.length){ // If questions still remaining
        handleNextButton();
    } else {
        // Navigate to index.html only when patch is successful
        window.location.href = 'index.html';
    }
});

// Start the quiz when the page loads
startQuiz();