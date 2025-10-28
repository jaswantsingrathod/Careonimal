import Joi from "joi";

export const providerValidation = Joi.object({
  user: Joi.string().optional(), // Added for backend to attach user id
  serviceType: Joi.string()
    .valid("boarding", "vet", "groomer")
    .required(),
  businessName: Joi.string()
    .min(3)
    .max(100)
    .required(),
  description: Joi.string()
    .max(300)
    .allow("", null),
  address: Joi.string().required(),
  city: Joi.string().required(),
  priceRange: Joi.string().allow("", null),
  contactNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  image: Joi.string().allow("", null),
  availability: Joi.boolean().default(true),
  approvedByAdmin: Joi.boolean().default(false),
  rating: Joi.number().min(0).max(5).default(0),
  totalReviews: Joi.number().default(0),
  role: Joi.string().valid('provider').default('provider')
});
