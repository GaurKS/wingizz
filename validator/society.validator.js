const Joi = require('joi');

const societySchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  contact: Joi.string().required(),
})