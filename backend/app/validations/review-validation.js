import Joi from "joi"

export const reviewValidation = Joi.object({
    provider: Joi.string().required(), // provider ID
    booking: Joi.string().required(), // booking ID
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().max(500).allow("", null)
})