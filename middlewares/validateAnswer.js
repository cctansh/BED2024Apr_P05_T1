const sql = require("mssql");
const dbConfig = require("../dbConfig");
const Joi = require("joi");

const validateCreateAnswer = async (req, res, next) => {
    const schema = Joi.object({
        question_id: Joi.number().integer().required(), // Added validation for question_id
        answer_text: Joi.string().min(1).max(8000).required(),
        is_correct: Joi.number().integer().valid(0, 1).required(),
        explanation: Joi.string().allow(null, "").max(8000)
    });

    const validation = schema.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map((error) => error.message);
        return res.status(400).json({ message: "Validation error", errors });
    }

    next();
};

const validateUpdateAnswer = async (req, res, next) => {
    const schema = Joi.object({
        question_id: Joi.number().integer().required(), // Added validation for question_id
        answer_text: Joi.string().min(1).max(8000).required(),
        is_correct: Joi.number().integer().valid(0, 1).required(),
        explanation: Joi.string().allow(null, "").max(8000)
    });

    const validation = schema.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map((error) => error.message);
        return res.status(400).json({ message: "Validation error", errors });
    }

    const answerId = parseInt(req.params.id);

    if (isNaN(answerId)) {
        return res.status(400).json({ message: "Validation error", errors: ["Invalid answer ID."] });
    }

    try {
        const connection = await sql.connect(dbConfig);
        const request = connection.request();
        request.input("answerId", answerId);

        const answerResult = await request.query(`SELECT COUNT(*) AS count FROM AnswerChoices WHERE id = @answerId`);
        connection.close();

        if (answerResult.recordset[0].count === 0) {
            return res.status(400).json({ message: "Validation error", errors: ["This answer does not exist."] });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: "Database error", error: error.message });
    }
};

module.exports = {
    validateCreateAnswer,
    validateUpdateAnswer
};
