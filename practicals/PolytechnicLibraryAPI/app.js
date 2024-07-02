const express = require("express");
const userController = require("./controllers/userController");
const bookController = require("./controllers/bookController");
const sql = require("mssql");
const dbConfig = require("./dbConfig");
const bodyParser = require("body-parser"); 
const authenticate = require("./middlewares/authenticate");
const validateUser = require("./middlewares/validateUser")
const validateBook = require("./middlewares/validateBook")

const app = express();
const port = 3000; 

// Include body-parser middleware to handle JSON data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form data handling

// book routes
app.get("/books", authenticate.verifyJWT, bookController.getAllBooks);
app.put("/books/:bookId/availability", authenticate.verifyJWT, validateBook.validateUpdateBook, bookController.updateBookAvailability); // PUT for updating books

// user routes
app.get("/users", userController.getAllUsers);
app.post("/register", validateUser.validateRegister, userController.registerUser);
app.post("/login", validateUser.validateLogin, userController.login);

// database
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