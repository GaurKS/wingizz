const Joi = require('joi');
const { fetchUser } = require('../mongodb/user.mongo');

// joi validators
exports.validateUserRegisterBody = async (ctx, next) => {
  const userRegisterBody = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({ 'any.only': 'Passwords do not match' }),
    address: Joi.object().keys({
      society: Joi.string().required(),
      wing: Joi.string().required(),
      flatNo: Joi.string().required()
    }).optional(),
    contact: Joi.string().optional(),
    token: Joi.string().optional()
  });

  const value = await userRegisterBody.validateAsync(ctx.request.body);
  ctx.request.body = value;
  await next();
}

exports.validateUserLoginBody = async (ctx, next) => {
  const userLoginBody = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
  })

  const value = await userLoginBody.validateAsync(ctx.request.body);
  ctx.request.body = value;
  await next();
}

exports.validateEditUserBody = async (ctx, next) => {
  const userEditBody = Joi.object({
    role: Joi.array().items(Joi.string()).optional(),
    active: Joi.boolean().optional(),
  });

  const value = await userEditBody.validateAsync(ctx.request.body);
  ctx.request.body = value;
  await next();
}

exports.validateRootUserBody = async (ctx, next) => {
  const rootUserBody = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
  });

  const value = await rootUserBody.validateAsync(ctx.request.body);
  ctx.request.body = value;
  await next();
}

exports.valiateInviteLinkBody = async (ctx, next) => {
  const inviteLinkBody = Joi.object({
    role: Joi.string().valid('secretary', 'admin', 'user').required(),
    society: Joi.string().required(),
    wing: Joi.string().when('role', {   // if role is A or U, wing is required
      is: Joi.string().valid('admin', 'user'),
      then: Joi.required()
    }),
  })

  const value = await inviteLinkBody.validateAsync(ctx.request.body);
  ctx.request.body = value;
  await next();
}


// custom validators
exports.isUserUnique = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const { email } = ctx.request.body;
  const user = await fetchUser(mongoClient, null, email)

  if (user) {
    return new Error(`User already exists with email: ${email}`);
  }
  return null;
}


