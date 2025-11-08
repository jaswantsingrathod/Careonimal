import Joi from "joi";

export const userRegisterValidation = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional().allow(""),
  role: Joi.string().valid('user', 'provider', 'admin').default('user')
});

export const userLoginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

