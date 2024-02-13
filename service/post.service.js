const AppException = require("../exception/app.exception");
const Post = require('../model/post.model');
const { generateUid } = require('../utils/generateUid')
const { fetchAllPosts, createPost, updatePost, deletePost, editReaction, fetchReaction } = require('../mongodb/post.mongo');
const { createSuccessResponse } = require("../utils/createResponse");
const { postToPage } = require("./fb.service");
const logger = require('../config/winston.config');
const envConfig = require("../config/env.config");
const Reaction = require("../model/reaction.model");


exports.getPost = async (ctx) => {
  ctx.status = 200;
  ctx.body = createSuccessResponse(
    ctx.originalUrl,
    ctx.method,
    ctx.status,
    {
      message: 'Post found successfully',
      post: ctx.post
    }
  )
}

exports.getAllPost = async (ctx) => {
  const mongoClient = ctx.dbClient;
  const { limit, skip, sort } = ctx.query;
  const posts = await fetchAllPosts(mongoClient, ctx.params.cid, sort, limit, skip);
  ctx.status = 200;
  ctx.body = createSuccessResponse(
    ctx.originalUrl,
    ctx.method,
    ctx.status,
    {
      message: 'Posts found successfully',
      data: posts
    }
  )
}

exports.createPost = async (ctx) => {
  const mongoClient = ctx.dbClient;
  const { text, media } = ctx.request.body;
  const post = new Post(
    generateUid("pid_"),
    ctx.params.cid,
    text,
    media || [],
    ctx.user.id
  );

  const result = await createPost(mongoClient, post);
  if (!result) {
    throw new AppException(`Post creation failed`, 'Post creation failed', 500);
  }

  if (ctx.request.body.publicPost) {
    const msg = {
      "message": text,
      "link": media[0],
      "published": true
    }
    const fbResponse = await postToPage(envConfig.fb_page_id, msg);
    logger.info(`Post created on facebook page. PostId: ${fbResponse}`)
  }
  ctx.status = 201;
  ctx.body = createSuccessResponse(
    ctx.originalUrl,
    ctx.method,
    ctx.status,
    {
      message: 'Post created successfully',
      post: result
    }
  )
}

exports.editPost = async (ctx) => {
  const { text, media } = ctx.request.body;
  const mongoClient = ctx.dbClient;
  const result = await updatePost(mongoClient, ctx.params.pid, text);
  if (!result) {
    throw new AppException(`Post update failed`, 'Post update failed', 500);
  }
  ctx.status = 201;
  ctx.body = createSuccessResponse(
    ctx.originalUrl,
    ctx.method,
    ctx.status,
    {
      message: 'Post updated successfully',
      post: result
    }
  )
}

exports.editPostReaction = async (ctx) => {
  const mongoClient = ctx.dbClient;
  const reaction = await fetchReaction(mongoClient, ctx.params.pid, null, ctx.user.id)

  if (!reaction) {
    const newReaction = new Reaction(ctx.params.pid, null, ctx.params.cid, 1, ctx.user.id)
    await mongoClient
      .db(envConfig.mongo_database)
      .collection(envConfig.mongo_reaction_collection)
      .insertOne(newReaction);
    await mongoClient
      .db(envConfig.mongo_database)
      .collection(envConfig.mongo_post_collection)
      .updateOne({ postId: ctx.params.pid }, { $inc: { upvote: 1 } });
  }
  else {
    if (reaction.reaction === 1) {
      await mongoClient
        .db(envConfig.mongo_database)
        .collection(envConfig.mongo_reaction_collection)
        .updateOne({ postId: ctx.params.pid, reactedBy: ctx.user.id }, { $set: { reaction: -1 } });
      await mongoClient
        .db(envConfig.mongo_database)
        .collection(envConfig.mongo_post_collection)
        .updateOne({ postId: ctx.params.pid }, { $inc: { upvote: -1 } });
    }
    else if (reaction.reaction === -1) {
      await mongoClient
        .db(envConfig.mongo_database)
        .collection(envConfig.mongo_reaction_collection)
        .updateOne({ postId: ctx.params.pid, reactedBy: ctx.user.id }, { $set: { reaction: 1 } });
      await mongoClient
        .db(envConfig.mongo_database)
        .collection(envConfig.mongo_post_collection)
        .updateOne({ postId: ctx.params.pid }, { $inc: { upvote: 1, downvote: -1 } });
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

exports.deletePost = async (ctx) => {
  const mongoClient = ctx.dbClient;
  const result = await deletePost(mongoClient, ctx.params.pid);
  if (!result) {
    throw new AppException(`Post delete failed`, 'Post delete failed', 500);
  }
  ctx.status = 201;
  ctx.body = createSuccessResponse(
    ctx.originalUrl,
    ctx.method,
    ctx.status,
    {
      message: 'Post deleted successfully',
      post: result
    }
  )
}