const sql = require("mssql");
const dbConfig = require("../dbConfig");
const Joi = require("joi");

const validateCreateReply = async (req, res, next) => {
    const schema = Joi.object({
        replyText: Joi.string().min(1).max(5000).required(),
        accId: Joi.number().integer().required(),
        replyTo: Joi.number().integer().required()
    });

    const validation = schema.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map((error) => error.message);
        res.status(400).json({ message: "Validation error", errors });
        return;
    }

    const { accId, replyTo } = req.body;

    try {
        const connection = await sql.connect(dbConfig);
        const request = connection.request();

        // check account exists
        request.input("accId", accId);
        const accResult = await request.query(`SELECT COUNT(*) AS count FROM Account WHERE accId = @accId`);
        if (accResult.recordset[0].count === 0) {
            return res.status(400).json({ message: "Validation error", errors: ["This account does not exist."] });
        }

        // check if post exists
        request.input("postId", replyTo);
        const postResult = await request.query(`SELECT COUNT(*) AS count FROM Post WHERE postId = @postId`);

        connection.close(); // close connection

        if (postResult.recordset[0].count === 0) { // checking post
            return res.status(400).json({ message: "Validation error", errors: ["The post you are replying to does not exist."] });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: "Database error", error: error.message });
    }
};

const validateUpdateReply = (req, res, next) => {
    const schema = Joi.object({
        replyText: Joi.string().min(1).max(5000).required()
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
    validateCreateReply,
    validateUpdateReply
};