// Import mssql, dbConfig, joi to validatePost.js
const sql = require("mssql");
const dbConfig = require("../dbConfig");
const Joi = require("joi");

// Middleware to validate post before creating and storing it in DB
const validateCreatePost = async (req, res, next) => {
  const schema = Joi.object({
    postTitle: Joi.string().min(1).max(8000).required(), // postTitle must be a string, minimum 1 maximum 8000 characters and is required
    postText: Joi.string().min(1).max(8000).required(), // postText must be a string, minimum 1 maximum 8000 characters and is required
    accId: Joi.number().integer().required() // accId must be a number (integer, no decimals) and is required
  });

  // Validate the request body against the defined schema above
  // abortEarly: false is to make sure it will not stop at the first error it encounters
  // Continue to check all fields and collect all validation errors, then display list of all validation errors at once to the user
  const validation = schema.validate(req.body, { abortEarly: false });

  if (validation.error) {
    // Extract error messages from validation.error.details
    // validation.error.details is an array of error objects
    // Each error object contains a message property with a description of the validation issue
    const errors = validation.error.details.map((error) => error.message);
    
    // Respond with status code 400 (Bad Request) with message containing all validation error messages
    res.status(400).json({ message: "Validation error", errors });
    
    return; // Return/stop the program early if validation fails so subsequent code won't run
  }
  // If no validation errors, get accId from req.body
  const { accId } = req.body;

  try {
    const connection = await sql.connect(dbConfig); // Establish connection using configuration defined in dbConfig
    const request = connection.request(); // Create new request object associated with the established connection

    request.input("accId", accId); // Set input parameter accId with value from req.body.accId

    // Execute SQL query to count occurrences of accId in Account table
    const accResult = await request.query(`SELECT COUNT(*) AS count FROM Account WHERE accId = @accId`);

    connection.close(); // Close connection to release resources

    // Check if the account exists
    if (accResult.recordset[0].count === 0) {
      return res.status(400).json({ message: "Validation error", errors: ["This account does not exist."] });
    }

    next(); // Proceed to the next middleware/controller function if account exists
  } catch (error) {
    return res.status(500).json({ message: "Database error", error: error.message }); // Send response with status code 500 (Internal Server Error) with error message
  }
};

// Middleware to validate post before updating and storing it in DB
const validateUpdatePost = (req, res, next) => {
  const schema = Joi.object({
    postTitle: Joi.string().min(1).max(8000).required(), // postTitle must be a string, minimum 1 maximum 8000 characters and is required
    postText: Joi.string().min(1).max(8000).required(), // postText must be a string, minimum 1 maximum 8000 characters and is required
    adminEdit: Joi.number().integer().min(0).max(1).required() // accId must be a number (integer, no decimals) and is required
  });

  // Validate the request body against the defined schema above
  // abortEarly: false is to make sure it will not stop at the first error it encounters
  // Continue to check all fields and collect all validation errors, then display list of all validation errors at once to the user
  const validation = schema.validate(req.body, { abortEarly: false });

  if (validation.error) {
    // Extract error messages from validation.error.details
    // validation.error.details is an array of error objects
    // Each error object contains a message property with a description of the validation issue
    const errors = validation.error.details.map((error) => error.message);

    // Respond with status code 400 (Bad Request) with message containing all validation error messages
    res.status(400).json({ message: "Validation error", errors });
    
    return; // Terminate middleware execution on validation error
  }

  next(); // If validation passes, proceed to the next route handler
};

// Export all controllers from validatePost.js so that it can be imported and used in other files/modules
module.exports = {
  validateCreatePost,
  validateUpdatePost
};