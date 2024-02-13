const { fetchComment } = require("../mongodb/comment.mongo");
const joi = require('joi');
const { fetchPost, fetchReaction } = require("../mongodb/post.mongo");



exports.validateCommentBody = async (ctx, next) => {
  const createCommentBody = joi.object({
    text: joi.string().required(),
    media: joi.array().items(joi.string().uri()).max(5).optional()
  });

  const value = await createCommentBody.validateAsync(ctx.request.body);
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
  const { coid } = ctx.params;
  const comment = await fetchComment(mongoClient, coid);

  if (!comment) {
    return new Error(`Invalid comment id`)
  }

  ctx.comment = comment;
  return null;
}

exports.isUserValid = async (ctx) => {
  const { user } = ctx;
  if (ctx.channel && (ctx.channel.members.indexOf(user.id) !== -1 || ctx.channel.admins.indexOf(user.id) !== -1)) {
    return null;
  }
  return new Error(`User not allowed to read this comment`)
}

exports.canEdit = async (ctx) => {
  const { comment } = ctx;
  const { user } = ctx;
  if (comment && comment.author !== user.id) {
    return new Error(`User not allowed to edit this comment`)
  }
  return null;
}

// exports.checkCommentReaction = async (ctx) => {
//   const { id } = ctx.user;
//   const { pid } = ctx.params;
//   const mongoClient = ctx.dbClient;

//   const reaction = await fetchReaction(mongoClient, id, pid);