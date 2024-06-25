const Joi = require("joi");

const validateUpdateBook = (req, res, next) => {
  const schema = Joi.object({
    availability: Joi.string().valid('Y','N').required(), // availability required, only 'Y' or 'N'
  });

  const validation = schema.validate(req.body, { abortEarly: false }); // validate entire object

  //terminate if error
  if (validation.error) {
    const errors = validation.error.details.map((error) => error.message);
    res.status(400).json({ message: "Validation error", errors });
    return; 
  }

  next(); // If validation passes, proceed to the next route handler
};

module.exports = {
  validateUpdateBook
};