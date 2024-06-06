const express = require("express");
const postController = require("./controllers/postController")
const replyController = require("./controllers/replyController")
const sql = require("mssql"); // Assuming you've installed mssql
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser");
const validatePost = require("./middlewares/validatePost")
const validateReply = require("./middlewares/validateReply")

const app = express();
const port = process.env.PORT || 3000; // Use environment variable or default port

const staticMiddleware = express.static("public");

// Include body-parser middleware to handle JSON data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data handling

app.use(staticMiddleware);

// Routes for GET requests (replace with appropriate routes for update and delete later)
app.get("/posts", postController.getAllPosts);
app.get("/posts/:id", postController.getPostById);
app.post("/posts", validatePost.validateCreatePost, postController.createPost);
app.put("/posts/:id", validatePost.validateUpdatePost, postController.updatePost); // PUT for updating posts
app.delete("/posts/:id", postController.deletePost); // DELETE for deleting posts

app.get("/replies/search/author", replyController.searchRepliesByAuthor);
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