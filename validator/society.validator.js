const { fetchSociety } = require("../mongodb/society.mongo");
const Joi = require('joi');

exports.isSocietyValid = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const { sid } = ctx.params;
  const society = await fetchSociety(mongoClient, sid, null, null);

  if (!society) {
    return new Error(`Invalid society id`)
  }
  ctx.society = society;
  return null;
}

exports.isSocietyNew = async (ctx) => {
  const { email } = ctx.request.body;
  const { id } = ctx.user;
  const mongoClient = await ctx.dbClient;

  const society = await fetchSociety(mongoClient, null, email, id);

  if (society) {
    return new Error(`Society already exists with email: ${email}`);
  }
  return null;
}

exports.validateSocietyRegisterBody = async (ctx, next) => {
  const societyRegisterBody = Joi.object({
    societyName: Joi.string().required(),
    email: Joi.string().email().required(),
    address: Joi.string().required(),
    resource: Joi.array().items(Joi.object({
      resourceName: Joi.string().required(),
      count: Joi.number().required(),
      capacity: Joi.number().required(),
    })).required(),
    wing: Joi.array().items(Joi.object({
      wingName: Joi.string().required(),
      resources: Joi.array().items(Joi.object({
        resourceName: Joi.string().required(),
        count: Joi.number().required(),
        capacity: Joi.number().required(),
      })).required()
    })).required()
  });

  const value = await societyRegisterBody.validateAsync(ctx.request.body);
  ctx.request.body = value;
  await next();
}

exports.validateAddResourceBody = async (ctx, next) => {
  const addResourceBody = Joi.object({
    wingId: Joi.string().optional(),
    resource: Joi.array().items(Joi.object({
      resourceName: Joi.string().required(),
      count: Joi.number().required(),
      capacity: Joi.number().required(),
    })).required()
  });

  const value = await addResourceBody.validateAsync(ctx.request.body);
  ctx.request.body = value;
  await next();
}

