// Retrieve necessary elements
const token = localStorage.getItem('token'); // Retrieve token from local storage
const loginProfileLink = document.getElementById('login-profile-link'); // Retrieve profile link element
const loginAccId = localStorage.getItem('loginAccId'); // Retrieve logged-in account ID from local storage
const loginAccRole = localStorage.getItem('loginAccRole'); // Retrieve logged-in account role from local storage
const rToken = getCookie('rToken');

if (token && !isTokenExpired(token)) {
  loginProfileLink.innerHTML = `Profile&ensp;<i class="bi bi-person-fill"></i>`;
  loginProfileLink.setAttribute("href", `profile.html?id=${loginAccId}`)
} else if (rToken) {
  refreshToken(rToken);
} else {
  sessionStorage.clear()
  loginProfileLink.innerHTML = `Login&ensp;<i class="bi bi-person-fill"></i>`;
  loginProfileLink.setAttribute("href", 'loginreg.html')
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

// Function to start the quiz
function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  nextButton.innerHTML = "Next";
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

// Fetch answers for a specific question from the server
async function fetchAnswers(questionId) {
  try {
    const response = await fetch(`/quiz/answers/${questionId}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching answers:', error);
    return [];
  }
}

// Show the current question and its answers
async function showQuestion() {
  resetState(); // Clear any previous question's state
  const currentQuestion = questions[currentQuestionIndex];
  questionElement.innerHTML = `${currentQuestionIndex + 1}. ${currentQuestion.question}`;

  // Check if there's an image for the current question
  if (currentQuestion.image_path) {
    const imageElement = document.createElement("img");
    imageElement.src = currentQuestion.image_path;
    imageElement.classList.add("question-image");
    questionElement.appendChild(imageElement);
  }

  // Fetch answers from the server and create buttons for each answer option
  const answers = await fetchAnswers(currentQuestion.id);
  answers.forEach(answer => {
    const button = document.createElement("button");
    button.innerHTML = answer.answer_text;
    button.classList.add("btn");
    button.dataset.correct = answer.is_correct;
    button.dataset.explanation = answer.explanation; // Store explanation in the button dataset
    button.addEventListener("click", selectAnswer);
    answerButtons.appendChild(button);
  });
}

// Reset the quiz state to default for the new question
function resetState() {
  nextButton.style.display = "none"; // Hide the next button

  // Remove previous answers and explanations
  while (answerButtons.firstChild) {
    answerButtons.removeChild(answerButtons.firstChild);
  }
}

// Handle user answer selection
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

// Display the final score
function showScore() {
  resetState();
  questionElement.innerHTML = `You scored ${score} out of ${questions.length}!`;
  nextButton.innerHTML = "Done";
  nextButton.style.display = "block";
}

// Handle the next button click
function handleNextButton() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showScore();
  }
}

// Navigate to the homepage on quiz completion
nextButton.addEventListener("click", () => {
  if (currentQuestionIndex < questions.length) {
    handleNextButton();
  } else {
    window.location.href = 'index.html';
  }
});

// Start the quiz when the page loads
startQuiz();

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

// If user is admin, show admin view
if (token && loginAccRole === "admin") {
  setAdminView();
}

// Event listeners for the admin buttons
editButton.addEventListener('click', () => {
  window.location.href = 'editquiz.html';
});

crossButton.addEventListener('click', () => {
  window.location.href = 'index.html';
});

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
  for(let i = 0; i <ca.length; i++) {
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
      console.log("error")
      alert('Login timed out.');
      sessionStorage.clear();
      deleteCookie('rToken');   
      location.reload();
  }
}