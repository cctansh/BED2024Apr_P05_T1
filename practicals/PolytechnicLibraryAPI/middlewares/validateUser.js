const Joi = require("joi");

const validateRegister = async (req, res, next) => {
    const schema = Joi.object({
        username: Joi.string().required(), // username string required
        password: Joi.string().min(6).required() // password string required, min 6 chara
        .messages({
            'string.pattern.base': 'Password must be at least 6 characters long.'
        }),
        role: Joi.string().valid('librarian','member').required(), // role required, must be 'librarian' or 'member'
    });

    const validation = schema.validate(req.body, { abortEarly: false });// validate entire object

    //terminate if error
    if (validation.error) {
        const errors = validation.error.details.map((error) => error.message);
        res.status(400).json({ message: "Validation error", errors });
        return;
    }

    next();
};

const validateLogin = async (req, res, next) => {
    const schema = Joi.object({
        username: Joi.string().required(), // username string required
        password: Joi.string().required() // password string required
    });

    const validation = schema.validate(req.body, { abortEarly: false });// validate entire object

    //terminate if error
    if (validation.error) {
        const errors = validation.error.details.map((error) => error.message);
        res.status(400).json({ message: "Validation error", errors });
        return;
    }

    next();
};


module.exports = {
    validateRegister,
    validateLogin
};