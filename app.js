// Import all modules required
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json"); // Import generated spec
const accountController = require("./controllers/accountController");
const postController = require("./controllers/postController");
const replyController = require("./controllers/replyController");
const quizController = require('./controllers/quizController');
const answerController = require('./controllers/answerController');
const sql = require("mssql");
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser");
const validateAccount = require("./middlewares/validateAccount")
const validatePost = require("./middlewares/validatePost")
const validateReply = require("./middlewares/validateReply")
const authenticate = require("./middlewares/authenticate")
const validateAnswer = require("./middlewares/validateAnswer")
const seedDatabase = require("./seed");

const app = express(); // Create an instance of express
const port = process.env.PORT || 3000; // Use environment variable or default port

const staticMiddleware = express.static("public");

// Include body-parser middleware to handle JSON data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data handling

app.use(staticMiddleware);

// Account routes
app.get("/accounts", accountController.getAllAccounts);
app.get("/accounts/:id", accountController.getAccountById);
app.get("/accounts/postreply/:id", accountController.getPostsAndRepliesByAccount);
app.post("/accounts/login", validateAccount.validateLoginAccount, accountController.loginAccount);
app.post("/accounts", validateAccount.validateCreateAccount, accountController.createAccount);
// Only account owner
app.put("/accounts/:id", authenticate.verifyJWT, validateAccount.validateUpdateAccount, accountController.updateAccount);
app.post("/accounts/check", authenticate.verifyJWT, accountController.checkPassword);
// Account owner and admin
app.delete("/accounts/:id", authenticate.verifyJWT, accountController.deleteAccount);
// Only admin
app.put("/accounts/role/:id", authenticate.verifyJWT, validateAccount.validateUpdateAccountRole, accountController.updateAccountRole);
// refresh token stuff
app.post("/token", accountController.refreshAccessToken);
app.delete("/logout", accountController.logout);

// Post routes
app.get("/posts", postController.getAllPosts);
app.get("/posts/:id", postController.getPostById);
app.post("/posts", authenticate.verifyJWT, validatePost.validateCreatePost, postController.createPost);
app.put("/posts/:id", authenticate.verifyJWT, validatePost.validateUpdatePost, postController.updatePost);
app.delete("/posts/:id", authenticate.verifyJWT, postController.deletePost);
app.get("/posts/:id/replyCount", postController.getReplyCount); // route to get reply count for a post (used in frontend js)

// Reply routes
app.get("/replies", replyController.getAllReplies);
app.get("/replies/:id", replyController.getReplyById);
app.get("/replies/by-post/:id", replyController.getRepliesByPost);
app.get("/replies/post/:id", replyController.getRepliedPost);
// Reply owner and admin
app.post("/replies", authenticate.verifyJWT, validateReply.validateCreateReply, replyController.createReply);
app.put("/replies/:id", authenticate.verifyJWT, validateReply.validateUpdateReply, replyController.updateReply);
app.delete("/replies/:id", authenticate.verifyJWT, replyController.deleteReply);

// Quiz question routes
app.get("/quiz/questions", quizController.getAllQuizQuestions);
app.get("/quiz/questions/:id", quizController.getQuizQuestionById);
app.post("/quiz/questions", quizController.createQuizQuestion);
app.put("/quiz/questions/:id", quizController.updateQuizQuestion);
app.delete("/quiz/questions/:id", quizController.deleteQuizQuestion);

// Quiz answer routes
app.get("/quiz/answers/:id", answerController.getAnswersByQuestion);
app.get("/quiz/answer/:id", answerController.getAnswerById);
app.post("/quiz/answers", validateAnswer.validateCreateAnswer, answerController.createAnswer);
app.put("/quiz/answers/:id", validateAnswer.validateUpdateAnswer, answerController.updateAnswer);
app.delete("/quiz/answers/:id", answerController.deleteAnswer);

// Serve the Swagger UI at a specific route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start the server and connect to DB
app.listen(port, async () => {
  try {
    // Connect to DB using mssql
    await sql.connect(dbConfig);

    // Seed DB with initial data
    seedDatabase();

    console.log("Database connection established successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    // Terminate the application with an error code (optional)
    process.exit(1); // Exit with code 1 indicating an error
  }

  console.log(`Server listening on port ${port}`);
});

// Gracefully handle shutdown by closing DB connection pool on SIGINT signal
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  // Perform cleanup tasks (e.g., close database connections)
  await sql.close();
  console.log("Database connection closed");
  process.exit(0); // Exit with code 0 indicating successful shutdown
});