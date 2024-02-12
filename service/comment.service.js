const AppException = require("../exception/app.exception")
const Comment = require("../model/comment.model")
const { updateComment, deleteComment } = require("../mongodb/comment.mongo")
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

exports.createComment = async (ctx) => {
  const { text } = ctx.request.body;
  const comment = new Comment(
    generateUid('coid_'),
    ctx.params.pid,
    ctx.user.userId,
    ctx.post.channelId,
    text,
    ctx.request.body.media || [],
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

  const result = await updateComment(mongoClient, ctx.params.cid, text);

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
  const result = await deleteComment(mongoClient, ctx.params.cid);
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
