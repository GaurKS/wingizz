const envConfig = require("../config/env.config");

exports.fetchPost = async (mongoClient, pid) => {
  const post = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_post_collection)
    .findOne({ postId: pid })

  return post;
}

exports.fetchAllPosts = async (mongoClient, cid, sort = -1, limit = 10, skip = 0) => {
  const posts = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_post_collection)
    .find({ channelId: cid })
    .sort({ createdAt: parseInt(sort) })
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .toArray();

  return posts;
}

exports.createPost = async (mongoClient, post) => {
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_post_collection)
    .insertOne(post);

  return result;
}

exports.updatePost = async (mongoClient, pid, text) => {
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_post_collection)
    .updateOne({ postId: pid }, { $set: { text: text } });

  return result;
}

exports.deletePost = async (mongoClient, pid) => {
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_post_collection)
    .deleteOne({ postId: pid });

  return result;

}

/**
 * 
 * @param {*} mongoClient 
 * @param {*} postId 
 * @param {*} commentId 
 * @param {*} userId 
 * @returns 
 */
exports.fetchReaction = async (mongoClient, postId, commentId, userId) => {
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_reaction_collection)
    .findOne({ postId: postId, reactedBy: userId });

  return result;
}

/**
 * 
 * @param {*} mongoClient 
 * @param {*} reaction 
 * @param {*} postId 
 * @param {*} commentId 
 * @param {*} userId 
 * @returns 
 */
exports.editReaction = async (mongoClient, reaction, postId, commentId, userId) => {
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_reaction_collection)
    .findOneAndUpdate({ $and: [{ postId: postId }, { reactedBy: userId }] }, { $set: { reaction: reaction } }, { upsert: true });

  await collection.findOneAndUpdate(filter, update, { upsert: true })

  return result;
}