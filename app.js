const express = require("express");
const accountController = require("./controllers/accountController");
const postController = require("./controllers/postController");
const replyController = require("./controllers/replyController");
const sql = require("mssql"); 
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser");
const validateAccount = require("./middlewares/validateAccount")
const validatePost = require("./middlewares/validatePost")
const validateReply = require("./middlewares/validateReply")

const app = express();
const port = process.env.PORT || 3000; // Use environment variable or default port

const staticMiddleware = express.static("public");

// Include body-parser middleware to handle JSON data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data handling

app.use(staticMiddleware);

// account routes
app.get("/accounts", accountController.getAllAccounts);
app.get("/accounts/:id", accountController.getAccountById);
app.post("/accounts/login", validateAccount.validateLoginAccount, accountController.loginAccount);
app.post("/accounts", validateAccount.validateCreateAccount, accountController.createAccount);
app.put("/accounts/:id", validateAccount.validateUpdateAccount, accountController.updateAccount); 
app.delete("/accounts/:id", accountController.deleteAccount); 

// post routes
app.get("/posts", postController.getAllPosts);
app.get("/posts/:id", postController.getPostById);
app.post("/posts", validatePost.validateCreatePost, postController.createPost);
app.put("/posts/:id", validatePost.validateUpdatePost, postController.updatePost); 
app.delete("/posts/:id", postController.deletePost); 
app.get("/posts/:id/replyCount", postController.getReplyCount); // route to get reply count for a post (used in frontend js)

// reply routes
app.get("/replies/search/account", replyController.searchRepliesByAccount);
app.get("/replies/search/text", replyController.searchRepliesByText);
app.get("/replies", replyController.getAllReplies);
app.get("/replies/:id", replyController.getReplyById);
app.get("/replies/by-post/:id", replyController.getRepliesByPost);
app.get("/replies/post/:id", replyController.getRepliedPost);
app.post("/replies", validateReply.validateCreateReply, replyController.createReply);
app.put("/replies/:id", validateReply.validateUpdateReply, replyController.updateReply);
app.delete("/replies/:id", replyController.deleteReply);

app.listen(port, async () => {
  try {
    // Connect to the database
    await sql.connect(dbConfig);
    console.log("Database connection established successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    // Terminate the application with an error code (optional)
    process.exit(1); // Exit with code 1 indicating an error
  }

  console.log(`Server listening on port ${port}`);
});

// Close the connection pool on SIGINT signal
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  // Perform cleanup tasks (e.g., close database connections)
  await sql.close();
  console.log("Database connection closed");
  process.exit(0); // Exit with code 0 indicating successful shutdown
});