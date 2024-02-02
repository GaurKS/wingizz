const Joi = require('joi');

const userLoginBody = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
})

const userRegisterBody = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({ 'any.only': 'Passwords do not match' }),
  contact: Joi.string().optional(),
  address: Joi.object({
    house: Joi.string().required(),
    wing: Joi.string().required(),
    society: Joi.string().required(),
  })
});

const userEditBody = Joi.object({
  role: Joi.array().items(Joi.string()).optional(),
  active: Joi.boolean().optional(),
});

const validateUserRegisterBody = async (ctx, next) => {
  const value = await userRegisterBody.validateAsync(ctx.request.body);
  ctx.request.body = value;
  await next();
}

const validateUserLoginBody = async (ctx, next) => {
  const value = await userLoginBody.validateAsync(ctx.request.body);
  ctx.request.body = value;
  await next();
}

const validateEditUserBody = async (ctx, next) => {
  const value = await userEditBody.validateAsync(ctx.request.body);
  ctx.request.body = value;
  await next();
}

module.exports = {
  validateUserRegisterBody,
  validateUserLoginBody,
  validateEditUserBody
};