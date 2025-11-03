import Joi from "joi";

export const subscriptionValidation = Joi.object({
  planType: Joi.string()
    .valid("basic", "premium", "pro")
    .required()
    .messages({
      "any.only": "Plan type must be either basic, premium, or pro",
      "any.required": "Plan type is required",
    }),
});
