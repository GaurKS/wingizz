const joi = require("joi");
const { fetchRequest } = require("../mongodb/request.mongo");

exports.validateCreateRequestBody = async (ctx, next) => {
  const createRequestBody = joi.object({
    resourceId: joi.string().required(),
    description: joi.string().required(),
    date: joi.date().required(),
    publicPost: joi.boolean().required()
  });

  const value = await createRequestBody.validateAsync(ctx.request.body);
  ctx.request.body = value;
  await next();
}

exports.validateEditRequestBody = async (ctx, next) => {
  const editBody = joi.object({
    status: joi.string().valid("APPROVED", "REJECTED").required()
  });

  const value = await editBody.validateAsync(ctx.request.body);
  ctx.request.body = value;
  await next();
}

exports.isRequestValid = async (ctx) => {
  const mongoClient = await ctx.dbClient;

  const request = await fetchRequest(mongoClient, ctx.params.cid, ctx.params.rid);
  if (!request) {
    return new Error(`Invalid request id`);
  }
  ctx.Request = request;
  return null;
}

exports.isAdmin = async (ctx) => {
  const { user, channel } = ctx;
  if (channel.admins.indexOf(user.id) !== -1) {
    return new Error(`Admin only route`);
  }
  return null;
}

exports.isRequestAllowed = async (ctx) => {
  const { user, Request } = ctx;
  if (Request.requestedBy !== user.id) {
    return new Error(`User not allowed to access this request`);
  }
  return null;
}

exports.isResourceAllowed = async (ctx) => {
  const { resourceId } = ctx.request.body;
  const { channel } = ctx;
  if (channel && channel.resources.indexOf(resourceId) !== -1) {
    return null;
  }
  return new Error(`User not allowed to access this resource`);
}