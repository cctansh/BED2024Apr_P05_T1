const sql = require("mssql");
const dbConfig = require("../dbConfig");
const Joi = require("joi");

const validateCreatePost = async (req, res, next) => {
  const schema = Joi.object({
    postTitle: Joi.string().min(1).max(8000).required(),
    postText: Joi.string().min(1).max(8000).required(),
    accId: Joi.number().integer().required()
  });

  const validation = schema.validate(req.body, { abortEarly: false });

  if (validation.error) {
    const errors = validation.error.details.map((error) => error.message);
    res.status(400).json({ message: "Validation error", errors });
    return;
  }
  const { accId } = req.body;

  try {
    const connection = await sql.connect(dbConfig);
    const request = connection.request();

    // check account exists
    request.input("accId", accId);
    const accResult = await request.query(`SELECT COUNT(*) AS count FROM Account WHERE accId = @accId`);

    connection.close(); // close connection

    if (accResult.recordset[0].count === 0) { // checking account
      return res.status(400).json({ message: "Validation error", errors: ["This account does not exist."] });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Database error", error: error.message });
  }
};

const validateUpdatePost = (req, res, next) => {
  const schema = Joi.object({
    postTitle: Joi.string().min(1).max(8000).required(),
    postText: Joi.string().min(1).max(8000).required(),
  });

  const validation = schema.validate(req.body, { abortEarly: false }); // Validate request body

  if (validation.error) {
    const errors = validation.error.details.map((error) => error.message);
    res.status(400).json({ message: "Validation error", errors });
    return; // Terminate middleware execution on validation error
  }

  next(); // If validation passes, proceed to the next route handler
};

module.exports = {
  validateCreatePost,
  validateUpdatePost
};