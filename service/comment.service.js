const envConfig = require("../config/env.config")
const AppException = require("../exception/app.exception")
const Comment = require("../model/comment.model")
const Reaction = require("../model/reaction.model")
const { updateComment, deleteComment, createComment, fetchComments } = require("../mongodb/comment.mongo")
const { fetchReaction } = require("../mongodb/post.mongo")
const { createSuccessResponse } = require("../utils/createResponse")
const { generateUid } = require("../utils/generateUid")

exports.getComment = async (ctx) => {
  ctx.status = 200
  ctx.body = createSuccessResponse(
    ctx.originalUrl,
    ctx.method,
    ctx.status,
    {
      message: 'Comment found successfully',
      comment: ctx.comment
    }
  )
}

exports.getAllComments = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const { limit, skip, sort } = ctx.query;
  const comments = await fetchComments(mongoClient, ctx.params.cid, ctx.params.pid, sort, limit, skip);

  if (!comments) {
    throw new AppException(`Comments not found`, 'Comments not found', 404);
  }
  ctx.status = 200;
  ctx.body = createSuccessResponse(
    ctx.originalUrl,
    ctx.method,
    ctx.status,
    {
      message: 'Comments found successfully',
      comments
    }
  )
}

exports.createComment = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const { text, media } = ctx.request.body;
  const comment = new Comment(
    generateUid('coid_'),
    ctx.params.pid,
    ctx.user.id,
    ctx.params.cid,
    text,
    media || [],
  );

  const result = await createComment(mongoClient, comment);
  if (!result) {
    throw new AppException(`Comment creation failed`, 'Comment creation failed', 500);
  }
  ctx.status = 201;
  ctx.body = createSuccessResponse(
    ctx.originalUrl,
    ctx.method,
    ctx.status,
    {
      message: 'Comment created successfully',
      comment: result
    }
  )
}

exports.editComment = async (ctx) => {
  const { text } = ctx.request.body;
  const mongoClient = await ctx.dbClient;

  const result = await updateComment(mongoClient, ctx.params.coid, text);

  if (!result) {
    throw new AppException(`Comment update failed`, 'Comment update failed', 500);
  }
  ctx.status = 201;
  ctx.body = createSuccessResponse(
    ctx.originalUrl,
    ctx.method,
    ctx.status,
    {
      message: 'Comment updated successfully',
      comment: result
    }
  )
}

exports.deleteComment = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const result = await deleteComment(mongoClient, ctx.params.coid);
  if (!result) {
    throw new AppException(`Comment deletion failed`, 'Comment deletion failed', 500);
  }

  ctx.status = 200;
  ctx.body = createSuccessResponse(
    ctx.originalUrl,
    ctx.method,
    ctx.status,
    {
      message: 'Comment deleted successfully',
      comment: ctx.comment
    }
  )
}


exports.editCommentReaction = async (ctx) => {
  const mongoClient = ctx.dbClient;
  const reaction = await fetchReaction(mongoClient, null, ctx.params.coid, ctx.user.id)

  if (!reaction) {
    const newReaction = new Reaction(null, ctx.params.coid, ctx.params.cid, 1, ctx.user.id);
    await mongoClient
      .db(envConfig.mongo_database)
      .collection(envConfig.mongo_reaction_collection)
      .insertOne(newReaction)
    await mongoClient
      .db(envConfig.mongo_database)
      .collection(envConfig.mongo_comment_collection)
      .updateOne({ commentId: ctx.params.coid }, { $inc: { upvote: 1 } })
  }
  else {
    if (reaction.reaction === 1) {
      console.log(await mongoClient
        .db(envConfig.mongo_database)
        .collection(envConfig.mongo_reaction_collection)
        .updateOne({ commentId: ctx.params.coid, reactedBy: ctx.user.id }, { $set: { reaction: -1 } }))
      await mongoClient
        .db(envConfig.mongo_database)
        .collection(envConfig.mongo_comment_collection)
        .updateOne({ commentId: ctx.params.coid }, { $inc: { upvote: -1 } });
    }
    else if (reaction.reaction === -1) {
      await mongoClient
        .db(envConfig.mongo_database)
        .collection(envConfig.mongo_reaction_collection)
        .updateOne({ postId: ctx.params.pid, reactedBy: ctx.user.id }, { $set: { reaction: 1 } });
      await mongoClient
        .db(envConfig.mongo_database)
        .collection(envConfig.mongo_post_collection)
        .updateOne({ postId: ctx.params.pid }, { $inc: { upvote: 1 } });
    }
  }

  ctx.status = 201;
  ctx.body = createSuccessResponse(
    ctx.originalUrl,
    ctx.method,
    ctx.status,
    {
      message: 'Post reaction updated successfully'
    }
  )
}
