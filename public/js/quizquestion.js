// Retrieve necessary elements
const token = sessionStorage.getItem('token'); // Retrieve token from session storage
const loginProfileLink = document.getElementById('login-profile-link'); // Retrieve profile link element
const loginAccId = sessionStorage.getItem('loginAccId'); // Retrieve logged-in account ID from session storage
const loginAccRole = sessionStorage.getItem('loginAccRole'); // Retrieve logged-in account role from session storage
const rToken = getCookie('rToken'); // Retrieve refresh token from cookies

// Check if token exists and is not expired
if (token && !isTokenExpired(token)) {
  loginProfileLink.innerHTML = `Profile`;
  loginProfileLink.setAttribute("href", `profile.html?id=${loginAccId}`)
} else if (rToken) {
  refreshToken(rToken); // If token is expired but refresh token exists, refresh the token
} else {
  sessionStorage.clear(); // Clear session storage if no valid tokens exist
  loginProfileLink.innerHTML = `Login`;
  loginProfileLink.setAttribute("href", 'loginreg.html')
}

// Select DOM elements for the quiz and admin view
const questionElement = document.getElementById("question"); // Retrieve question element
const questionImage = document.getElementById('question-image'); // Retrieve question image element
const answerButtons = document.getElementById("answer-buttons"); // Retrieve answer buttons container
const nextButton = document.getElementById("next-btn"); // Retrieve next button
const editButton = document.getElementById("edit-button"); // Retrieve edit button
const crossButton = document.getElementById("cross-button"); // Retrieve cross button
const adminView = document.getElementById("adminView1"); // Retrieve admin view element

// Variables to track the current question index and user score
let currentQuestionIndex = 0;
let score = 0;
let questions = [];

// Function to start the quiz
function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  nextButton.innerHTML = "Next";
  fetchQuestions(); // Fetch questions from the server
}

// Fetch questions from the server
async function fetchQuestions() {
  try {
    const response = await fetch('/quiz/questions');
    questions = await response.json(); // Store questions in a variable
    showQuestion(); // Show the first question
  } catch (error) {
    console.error('Error fetching questions:', error);
  }
}

// Fetch answers for a specific question from the server
async function fetchAnswers(questionId) {
  try {
    const response = await fetch(`/quiz/answers/${questionId}`);
    return await response.json(); // Return the fetched answers
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
    console.log("Image path:", currentQuestion.image_path); 
    const imageElement = document.createElement("img");
    imageElement.src = currentQuestion.image_path;
    imageElement.alt = "Question Image";
    imageElement.style.maxWidth = "100%";
    imageElement.style.height = "auto";
    questionElement.appendChild(imageElement);
  }

  // Fetch answers from the server and create buttons for each answer option
  const answers = await fetchAnswers(currentQuestion.id);
  answers.forEach(answer => {
    const button = document.createElement("button");
    button.innerHTML = answer.answer_text;
    button.classList.add("answerbtn");
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
    showQuestion(); // Show the next question
  } else {
    showScore(); // Show the final score
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
    editButton.classList.remove('hide'); // Show edit button for admin
    crossButton.classList.remove('hide'); // Show cross button for admin
    adminView.classList.remove('hide'); // Show admin view
  } else {
    editButton.classList.add('hide'); // Hide edit button for non-admin
    crossButton.classList.add('hide'); // Hide cross button for non-admin
  }
}

// If user is admin, show admin view
if (token && loginAccRole === "admin") {
  setAdminView();
}

// Event listeners for the admin buttons
editButton.addEventListener('click', () => {
  window.location.href = 'editquiz.html'; // Redirect to edit quiz page
});

crossButton.addEventListener('click', () => {
  window.location.href = 'index.html'; // Redirect to homepage
});

// Function to check if the JWT token is expired
function isTokenExpired(token) {
  const payload = JSON.parse(atob(token.split('.')[1])); // Decode the token payload
  const expiry = payload.exp * 1000; // Convert expiry time to milliseconds
  return Date.now() > expiry; // Check if the current time is past the expiry time
}

// Function to parse JWT token
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
  for(let i = 0; i < ca.length; i++) {
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

// Function to refresh the JWT token using the refresh token
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
      
      location.reload(); // Reload the page after refreshing the token
  } catch {
      console.log("error")
      alert('Login timed out.');
      sessionStorage.clear();
      deleteCookie('rToken');   
      location.reload(); // Reload the page on error
  }
}
