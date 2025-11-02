import Joi from "joi";

export const providerValidation = Joi.object({
  serviceType: Joi.string()
    .valid("boarding", "vet", "groomer")
    .required(),

  businessName: Joi.string().min(3).max(100).required(),

  description: Joi.string().max(300).allow("", null),

  address: Joi.object({
    latitude: Joi.number().required().min(-90).max(90),
    longitude: Joi.number().required().min(-180).max(180)
  }).required(),

  city: Joi.string().required(),

  priceRange: Joi.string().allow("", null),

  contact: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),

  image: Joi.string().allow("", null),

  availability: Joi.boolean().default(true),

  approvedByAdmin: Joi.boolean().default(false),

  rating: Joi.number().min(0).max(5).default(0),

  totalReviews: Joi.number().default(0),

  servicesOffered: Joi.array().items(
    Joi.object({
      petType: Joi.string().min(1).max(50).required(),
      subServices: Joi.array().items(
        Joi.object({
          service: Joi.string().min(1).max(100).required(),
          description: Joi.string().allow("", null),
          price: Joi.number().min(0)
        })
      ).required()
    })
  )
});


export const providerUpdateValidation = Joi.object({
  serviceType: Joi.string().valid("boarding", "vet", "groomer"),
  businessName: Joi.string().min(3).max(100),
  description: Joi.string().max(300).allow("", null),

  //  keep same structure for address (not string)
  address: Joi.object({
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180)
  }),

  // city: Joi.string(),
  priceRange: Joi.string().allow("", null),
  contact: Joi.string().pattern(/^[0-9]{10}$/),
  image: Joi.string().allow("", null),
  availability: Joi.boolean(),
  approvedByAdmin: Joi.boolean(),
  rating: Joi.number().min(0).max(5),
  totalReviews: Joi.number(),

  //  preserve nested structure for servicesOffered
  servicesOffered: Joi.array().items(
    Joi.object({
      petType: Joi.string().min(1).max(50),
      subServices: Joi.array().items(
        Joi.object({
          service: Joi.string().min(1).max(100),
          description: Joi.string().allow("", null),
          price: Joi.number().min(0)
        })
      )
    })
  )
});