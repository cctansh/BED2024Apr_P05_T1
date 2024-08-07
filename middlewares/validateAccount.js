const Joi = require("joi");

const validateCreateAccount = async (req, res, next) => {
    const schema = Joi.object({
        accName: Joi.string().min(1).max(50).required(),
        accEmail: Joi.string().email().max(120).required(),
        accPassword: Joi.string()
            .min(6)
            .max(50)
            .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$'))
            .required()
            .messages({
                'string.pattern.base': 'Password must contain at least one letter and one number, and no spaces or special characters.'
            }),
        accRole: Joi.string().valid('admin','member').required()
    });

    const validation = schema.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map((error) => error.message);
        res.status(400).json({ message: "Validation error", errors });
        return;
    }

    next();
};

const validateUpdateAccount = (req, res, next) => {
    const schema = Joi.object({
        accName: Joi.string().min(1).max(50).optional(),
        accEmail: Joi.string().email().max(120).optional(),
        accPassword: Joi.string()
            .min(6)
            .max(50)
            .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9])'))
            .optional()
            .messages({
                'string.pattern.base': 'Password must contain at least one letter and one number.'
            })
    }).or('accName', 'accEmail', 'accPassword');

    const validation = schema.validate(req.body, { abortEarly: false }); // Validate request body

    if (validation.error) {
        const errors = validation.error.details.map((error) => error.message);
        res.status(400).json({ message: "Validation error", errors });
        return; // Terminate middleware execution on validation error
    }

    next(); // If validation passes, proceed to the next route handler
};

const validateUpdateAccountRole = async (req, res, next) => {
    const schema = Joi.object({
        accRole: Joi.string().valid('admin','member').required()
    });

    const validation = schema.validate(req.body, { abortEarly: false });

    if (validation.error) {
        const errors = validation.error.details.map((error) => error.message);
        res.status(400).json({ message: "Validation error", errors });
        return;
    }

    next();
};

const validateLoginAccount = async (req, res, next) => {
    const schema = Joi.object({
        accEmail: Joi.string().required(),
        accPassword: Joi.string().required()
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
    validateCreateAccount,
    validateUpdateAccount,
    validateUpdateAccountRole,
    validateLoginAccount
};