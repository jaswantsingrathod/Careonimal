import Joi from "joi";

export const bookingValidation = Joi.object({
  provider: Joi.string().required(), // provider ID

  petType: Joi.string().min(2).max(50).required(),

  service: Joi.string().min(2).max(100).required(),

  bookingDate: Joi.date().required(),

  timeSlot: Joi.string().min(3).max(50).required(),

  paymentStatus: Joi.string()
    .valid("pending", "completed", "failed")
    .default("pending"),

  bookingStatus: Joi.string()
    .valid("pending", "confirmed", "completed", "cancelled")
    .default("pending"),

  notes: Joi.string().allow("", null)
});
