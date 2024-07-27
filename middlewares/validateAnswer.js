const sql = require("mssql"); // Import the mssql library for SQL Server database operations
const dbConfig = require("../dbConfig"); // Import database configuration
const Joi = require("joi"); // Import Joi for schema validation

// Middleware to validate data when creating a new answer
const validateCreateAnswer = async (req, res, next) => {
    // Define validation schema using Joi
    const schema = Joi.object({
        question_id: Joi.number().integer().required(), // Validate that question_id is a required integer
        answer_text: Joi.string().min(1).max(8000).required(), // Validate that answer_text is a required string between 1 and 8000 characters
        is_correct: Joi.number().integer().valid(0, 1).required(), // Validate that is_correct is a required integer, either 0 or 1
        explanation: Joi.string().allow(null, "").max(8000) // Validate that explanation is a string, allowing null or empty values, up to 8000 characters
    });

    // Validate the request body against the schema
    const validation = schema.validate(req.body, { abortEarly: false });

    if (validation.error) {
        // If validation fails, extract error messages and respond with a 400 status code
        const errors = validation.error.details.map((error) => error.message);
        return res.status(400).json({ message: "Validation error", errors });
    }

    next(); // Proceed to the next middleware or route handler if validation is successful
};

// Middleware to validate data when updating an existing answer
const validateUpdateAnswer = async (req, res, next) => {
    // Define validation schema using Joi
    const schema = Joi.object({
        question_id: Joi.number().integer().required(), // Validate that question_id is a required integer
        answer_text: Joi.string().min(1).max(8000).required(), // Validate that answer_text is a required string between 1 and 8000 characters
        is_correct: Joi.number().integer().valid(0, 1).required(), // Validate that is_correct is a required integer, either 0 or 1
        explanation: Joi.string().allow(null, "").max(8000) // Validate that explanation is a string, allowing null or empty values, up to 8000 characters
    });

    // Validate the request body against the schema
    const validation = schema.validate(req.body, { abortEarly: false });

    if (validation.error) {
        // If validation fails, extract error messages and respond with a 400 status code
        const errors = validation.error.details.map((error) => error.message);
        return res.status(400).json({ message: "Validation error", errors });
    }

    // Extract and validate the answer ID from route parameters
    const answerId = parseInt(req.params.id);

    if (isNaN(answerId)) {
        // If answerId is not a number, respond with a 400 status code and error message
        return res.status(400).json({ message: "Validation error", errors: ["Invalid answer ID."] });
    }

    try {
        // Connect to the database
        const connection = await sql.connect(dbConfig);
        const request = connection.request();
        request.input("answerId", answerId);

        // Query the database to check if the answer exists
        const answerResult = await request.query(`SELECT COUNT(*) AS count FROM AnswerChoices WHERE id = @answerId`);
        connection.close();

        if (answerResult.recordset[0].count === 0) {
            // If the answer does not exist, respond with a 400 status code and error message
            return res.status(400).json({ message: "Validation error", errors: ["This answer does not exist."] });
        }

        next(); // Proceed to the next middleware or route handler if validation is successful
    } catch (error) {
        // Handle any errors that occur during the database operation and respond with a 500 status code
        return res.status(500).json({ message: "Database error", error: error.message });
    }
};

module.exports = {
    validateCreateAnswer,
    validateUpdateAnswer
};
