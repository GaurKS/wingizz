const envConfig = require("../config/env.config");
const AppException = require("../exception/app.exception");
const { generateUid } = require('../utils/generateUid');
const Event = require('../model/event.model');
const logger = require('../config/winston.config')
const { createSuccessResponse } = require('../utils/createResponse');
const Channel = require("../model/channel.model");
const { channelType, requestStatus, requestType } = require("../utils/types.enum");
const Notification = require("../model/notification.model");
const Comment = require("../model/comment.model");

const addChannel = async (ctx) => {
}

const addChannelMember = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const { channelId, userId } = ctx.request.body;

  const channel = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_channel_collection)
    .findOne({ channelId: channelId });

  if (!channel) {
    throw new AppException(`Channel not found. ChannelId: ${channelId}`, 'Channel not found.', 404)
  }

  if (channel.members.includes(userId)) {
    throw new AppException(`User already a member of the channel. UserId: ${userId}`, 'User already a member of the channel.', 409)
  }

  // check if valid user
  const user = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_user_collection)
    .findOne({ userTag: userId });

  if (!user || !user.active) {
    throw new AppException(`User not found. UserId: ${userId}`, 'User not found.', 404)
  }
  if (user.address.societyId !== channel.sid) {
    throw new AppException(`User not part of the society. UserId: ${userId}`, 'User not part of the society.', 403)
  }
  // TODO: add check for wingId if channeltype is wing

  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_channel_collection)
    .updateOne({ channelId: channelId }, { $push: { members: userId } });

  // TODO: create notification for the user

  if (!result) {
    throw new AppException('Failed to add member to the channel.', 'Failed to add member to the channel.', 500)
  }

  ctx.status = 201;
  ctx.body = {
    message: 'Member added to the channel successfully.',
    channelId: channelId,
    userId: userId
  }
}

const removeMember = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const { channelId, userId } = ctx.request.body;

  const channel = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_channel_collection)
    .findOne({ channelId: channelId });

  if (!channel) {
    throw new AppException(`Channel not found. ChannelId: ${channelId}`, 'Channel not found.', 404)
  }

  if (!channel.members.includes(userId)) {
    throw new AppException(`User not a member of the channel. UserId: ${userId}`, 'User not a member of the channel.', 409)
  }

  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_channel_collection)
    .updateOne({ channelId: channelId }, { $pull: { members: userId } });

  if (!result) {
    throw new AppException('Failed to remove member from the channel.', 'Failed to remove member from the channel.', 500)
  }

  ctx.status = 200;
  ctx.body = {
    message: 'Member removed from the channel successfully.',
    channelId: channelId,
    userId: userId
  }
}

const getChannel = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const { channelId } = ctx.params;

  const channel = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_channel_collection)
    .findOne({ channelId: channelId });

  if (!channel) {
    throw new AppException(`Channel not found. ChannelId: ${channelId}`, 'Channel not found.', 404)
  }

  ctx.status = 200;
  ctx.body = {
    message: 'Channel found.',
    channel: channel
  }
}

const getChannels = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const { societyId, type } = ctx.query;

  let query = {};
  if (societyId) {
    query.sid = societyId;
  }
  if (type) {
    query.channelType = type;
  }

  const channels = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_channel_collection)
    .find(query)
    .toArray();

  ctx.status = 200;
  ctx.body = {
    message: 'Channels found.',
    channels: channels
  }
}

const createRequest = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const requestedBy = ctx.state.user.userTag;
  const { channelId, type, requestedTo, requestedfor, date, title } = ctx.request.body;

  // check if valid request and also if the resource requetsed is available on the asked date
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_request_collection)
    .findOneAndUpdate(
      {
        channelId: channelId,
        requestType: type,
        requestedBy: requestedBy,
        requestedTo: requestedTo,
        requestedfor: requestedfor,
        date: date
      },
      { $setOnInsert: new Request(generateUid("rid_"), channelId, title, requestType, requestStatus.PENDING, requestedBy, requestedTo, requestedfor, date) },
      { upsert: true, returnOriginal: false }
    );

  if (!result.value) {
    throw new AppException('Request already exists.', 'Request already exists.', 409)
  }

  if (requestType === requestType.ADMIN) {
    // create a notification for the user 
    const newNotification = new Notification(
      generateUid("nid_"),
      `Request for ${title} on ${date} has been created.`,
      null,
      requestedTo,
      requestedBy,
      date
    );

    await mongoClient
      .db(envConfig.mongo_database)
      .collection(envConfig.mongo_event_collection)
      .insertOne(newEvent);
  }

  ctx.status = 201;
  ctx.body = {
    message: 'Request created successfully.',
    request: result.value
  }
}

const editRequestStatus = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const { requestId, status } = ctx.request.body;

  const request = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_request_collection)
    .findOne({ requestId: requestId });

  if (!request) {
    throw new AppException(`Request not found. RequestId: ${requestId}`, 'Request not found.', 404)
  }

  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_request_collection)
    .updateOne({ requestId: requestId }, { $set: { status: status } });

  if (!result) {
    throw new AppException('Failed to update request status.', 'Failed to update request status.', 500)
  }

  if (status === requestStatus.APPROVED) {
    // create a notification for the user and add event to the channel

    const newEvent = new Event(
      generateUid("eid_"),
      request.requestTitle,
      request.date,
      null,
      null,
      null,
      request.channelId
    );

    await mongoClient
      .db(envConfig.mongo_database)
      .collection(envConfig.mongo_event_collection)
      .insertOne(newEvent);
  };

  ctx.status = 200;
  ctx.body = {
    message: 'Request status updated successfully.',
    requestId: requestId
  }
}

const createPost = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const postedBy = ctx.state.user.userTag;
  const { cid } = ctx.params;
  const { text, media } = ctx.request.body;

  const channel = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_channel_collection)
    .findOne({ channelId: cid });

  if (!channel) {
    throw new AppException(`Channel not found. ChannelId: ${cid}`, 'Channel not found.', 404)
  }

  if (!channel.members.includes(postedBy)) {
    throw new AppException(`User not a member of the channel. UserId: ${postedBy}`, 'User not a member of the channel.', 403)
  }

  const newPost = new Post(generateUid("pid_"), text, media, postedBy);

  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_post_collection)
    .insertOne(newPost);

  if (!result) {
    throw new AppException('Failed to create post.', 'Failed to create post.', 500)
  }

  ctx.status = 201;
  ctx.body = {
    message: 'Post created successfully.',
    post: newPost
  }
}

const editPost = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const { postId, text, media } = ctx.request.body;

  const post = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_post_collection)
    .findOne({ postId: postId });

  if (!post) {
    throw new AppException(`Post not found. PostId: ${postId}`, 'Post not found.', 404)
  }

  if (post.createdBy !== ctx.state.user.userTag) {
    throw new AppException(`User not authorized to edit the post. UserId: ${ctx.state.user.userTag}`, 'User not authorized to edit the post.', 403)
  }

  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_post_collection)
    .updateOne({ postId: postId }, { $set: { text: text, media: media } });

  if (!result) {
    throw new AppException('Failed to update post.', 'Failed to update post.', 500)
  }

  ctx.status = 200;
  ctx.body = {
    message: 'Post updated successfully.',
    postId: postId
  }
}

const addComment = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const { postId, text } = ctx.request.body;
  const commentedBy = ctx.state.user.userTag;

  const post = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_comment_collection)
    .findOne({ postId: postId });

  if (!post) {
    throw new AppException(`Post not found. PostId: ${postId}`, 'Post not found.', 404)
  }

  const newComment = new Comment(generateUid("coid_"), text, commentedBy, postId);
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_comment_collection)
    .insertOne(newComment);

  if (!result) {
    throw new AppException('Failed to add comment.', 'Failed to add comment.', 500)
  }

  ctx.status = 201;
  ctx.body = {
    message: 'Comment added successfully.',
    comment: newComment
  };
}


module.exports = {
  addChannel,
  addChannelMember,
  removeMember,
  getChannel,
  getChannels,
  createRequest,
  editRequestStatus,
  createPost,
  editPost,
  addComment
}