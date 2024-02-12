const { fetchComment } = require("../mongodb/comment.mongo");
const joi = require('joi');
const { fetchPost } = require("../mongodb/post.mongo");

const createCommentBody = joi.object({
  channelId: joi.string().required(),
  text: joi.string().length(1000).required(),
  media: joi.array().items(joi.string().uri()).max(5).optional()
});

exports.validateCommentBody = async (ctx, next) => {
  const value = createCommentBody.validate(ctx.request.body);
  ctx.request.body = value;
  await next();
}

exports.isPostValid = async (ctx) => {
  const { pid } = ctx.params;
  const mongoClient = await ctx.dbClient;
  const post = await fetchPost(mongoClient, pid);

  if (!post) {
    return new Error(`Invalid post id`)
  }
  ctx.post = post;
  return null;
}

exports.isCommentValid = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const { cid } = ctx.params;
  const comment = await fetchComment(mongoClient, cid);

  if (!comment) {
    return new Error(`Invalid comment id`)
  }
  ctx.comment = comment;
  return null;
}

exports.isUserValid = async (ctx) => {
  const { comment } = ctx;
  const { user } = ctx;
  if (user.channels.indexOf(comment.channelId) === -1) {
    return new Error(`User not allowed to read this comment`)
  }
  return null;
}

exports.canEdit = async (ctx) => {
  const { comment } = ctx;
  const { user } = ctx;
  if (comment.author !== user.userId) {
    return new Error(`User not allowed to edit this comment`)
  }
  return null;
} 