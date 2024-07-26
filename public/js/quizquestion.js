// Retrieve necessary elements
const token = sessionStorage.getItem('token'); // Retrieve token from local storage
const loginProfileLink = document.getElementById('login-profile-link'); // Retrieve profile link element
const loginAccId = sessionStorage.getItem('loginAccId'); // Retrieve logged-in account ID from local storage
const loginAccRole = sessionStorage.getItem('loginAccRole'); // Retrieve logged-in account role from local storage
const rToken = getCookie('rToken');

if (token && !isTokenExpired(token)) {
  loginProfileLink.innerHTML = `Profile`;
  loginProfileLink.setAttribute("href", `profile.html?id=${loginAccId}`)
} else if (rToken) {
  refreshToken(rToken);
} else {
  sessionStorage.clear();
  loginProfileLink.innerHTML = `Login`;
  loginProfileLink.setAttribute("href", 'loginreg.html');
}

// Select DOM elements for the quiz and admin view
const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const editButton = document.getElementById("edit-button");
const crossButton = document.getElementById("cross-button");
const adminView = document.getElementById("adminView1");

// Variables to track the current question index and user score
let currentQuestionIndex = 0;
let score = 0;
let questions = [];

// Function to fetch questions from the server
async function fetchQuestions() {
  try {
    const response = await fetch('/quiz/questions');
    questions = await response.json();
    console.log("Questions fetched:", questions); // Debug logging
  } catch (error) {
    console.error('Error fetching questions:', error);
  }
}

// Function to show the current question and its answers
async function showQuestion() {
  resetState(); // Clear any previous question's state
  const currentQuestion = questions[currentQuestionIndex];
  questionElement.innerHTML = `${currentQuestionIndex + 1}. ${currentQuestion.question}`;
  console.log("Current question:", currentQuestion); // Debug logging

  // Check if there's an image for the current question
  if (currentQuestion.image_path) {
    const imageElement = document.createElement("img");
    imageElement.src = currentQuestion.image_path;
    imageElement.classList.add("question-image");
    questionElement.appendChild(imageElement);
  }

  // Fetch answers for the current question
  try {
    const response = await fetch(`/quiz/answers/${currentQuestion.id}`);
    const answers = await response.json();
    console.log("Answers fetched:", answers); // Debug logging
    answers.forEach(answer => {
      const button = document.createElement("button");
      button.innerHTML = answer.answer_text;
      button.classList.add("answerbtn");
      button.dataset.correct = answer.is_correct;
      button.dataset.explanation = answer.explanation; // Store explanation in the button dataset
      button.addEventListener("click", selectAnswer);
      answerButtons.appendChild(button);
    });
  } catch (error) {
    console.error('Error fetching answers:', error);
  }
}

// Function to reset the quiz state to default for the new question
function resetState() {
  nextButton.style.display = "none"; // Hide the next button

  // Remove previous answers and explanations
  while (answerButtons.firstChild) {
    answerButtons.removeChild(answerButtons.firstChild);
  }
}

// Function to handle user answer selection
function selectAnswer(e) {
  const selectedBtn = e.target;
  const isCorrect = selectedBtn.dataset.correct === "true";

  // Disable all buttons after selection and show the correct answer
  Array.from(answerButtons.children).forEach(button => {
    button.disabled = true;
    if (button.dataset.correct === "true") {
      button.classList.add("correct"); // Highlight the correct answer
      // Show explanation for correct answer
      const explanationDiv = document.createElement("div");
      explanationDiv.classList.add("explanation");
      explanationDiv.innerHTML = button.dataset.explanation;
      button.parentNode.insertBefore(explanationDiv, button.nextSibling);
    } else if (button === selectedBtn) {
      button.classList.add("incorrect"); // Highlight the incorrectly selected answer
    }
  });

  // Increment score if the selected answer is correct
  if (isCorrect) {
    score++;
  }

  nextButton.style.display = "block"; // Show the next button
}

// Function to display the final score
function showScore() {
  resetState();
  questionElement.innerHTML = `You scored ${score} out of ${questions.length}!`;
  nextButton.innerHTML = "Done";
  nextButton.style.display = "block";
}

// Function to handle the next button click
function handleNextButton() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showScore();
  }
}

// Function to start the quiz
async function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  nextButton.innerHTML = "Next";
  await fetchQuestions();
  if (questions.length > 0) {
    showQuestion();
  } else {
    questionElement.innerHTML = "No questions available.";
  }
}

// Function to set admin view if user is admin
function setAdminView() {
  if (loginAccRole === 'admin') {
    editButton.classList.remove('hide');
    crossButton.classList.remove('hide');
    adminView.classList.remove('hide');
  } else {
    editButton.classList.add('hide');
    crossButton.classList.add('hide');
  }
}

// Function to check if the token is expired
function isTokenExpired(token) {
  const payload = JSON.parse(atob(token.split('.')[1])); // Decode the token payload
  const expiry = payload.exp * 1000; // Convert expiry time to milliseconds
  return Date.now() > expiry; // Check if the current time is past the expiry time
}

// Function to parse a JWT token
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

// Function to refresh the token
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
  } catch (error) {
    console.log("Error refreshing token:", error);
    alert('Login timed out.');
    sessionStorage.clear();
    deleteCookie('rToken');
    location.reload();
  }
}

// Start the quiz when the page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed"); // Debug logging
  startQuiz();
  if (token && loginAccRole === "admin") {
    setAdminView();
  }
});

// Event listeners for the admin buttons
editButton.addEventListener('click', () => {
  window.location.href = 'editquiz.html';
});

crossButton.addEventListener('click', () => {
  window.location.href = 'index.html';
});

// Navigate to the homepage on quiz completion
nextButton.addEventListener("click", () => {
  if (currentQuestionIndex < questions.length) {
    handleNextButton();
  } else {
    window.location.href = 'index.html';
  }
});
