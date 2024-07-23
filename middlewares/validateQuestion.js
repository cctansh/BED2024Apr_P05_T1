const sql = require("mssql");
const dbConfig = require("../dbConfig");
const Joi = require("joi");

// Validation middleware for creating a question
const validateCreateQuestion = async (req, res, next) => {
    const schema = Joi.object({
        question: Joi.string().min(1).max(5000).required(),
        image_path: Joi.string().uri().allow(null).optional()
    });

    const validation = schema.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map((error) => error.message);
        res.status(400).json({ message: "Validation error", errors });
        return;
    }

    next();
};

// Validation middleware for updating a question
const validateUpdateQuestion = (req, res, next) => {
    const schema = Joi.object({
        question: Joi.string().min(1).max(5000).required(),
        image_path: Joi.string().uri().allow(null).optional()
    });

    const validation = schema.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map((error) => error.message);
        res.status(400).json({ message: "Validation error", errors });
        return;
    }

    next();
};

module.exports = {
    validateCreateQuestion,
    validateUpdateQuestion
};
