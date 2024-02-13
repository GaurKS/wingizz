const envConfig = require("../config/env.config");

/**
 * 
 * @param {*} mongoClient 
 * @param {*} coid 
 * @returns 
 */
exports.fetchComment = async (mongoClient, coid) => {
  const comment = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_comment_collection)
    .findOne({ commentId: coid })

  return comment;
}

/**
 * 
 * @param {*} mongoClient 
 * @param {*} cid 
 * @param {*} pid 
 * @param {*} sort 
 * @param {*} limit 
 * @param {*} skip 
 * @returns 
 */
exports.fetchComments = async (mongoClient, cid, pid, sort = 1, limit = 5, skip = 0) => {
  const comments = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_comment_collection)
    .find({ postId: pid, channelId: cid })
    .sort({ createdAt: sort })
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .toArray();

  return comments;
}

/**
 * 
 * @param {*} mongoClient 
 * @param {*} comment 
 * @returns 
 */
exports.createComment = async (mongoClient, comment) => {
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_comment_collection)
    .insertOne(comment);

  return result;
}

/**
 * 
 * @param {*} mongoClient 
 * @param {*} coid 
 * @param {*} text 
 * @returns 
 */
exports.updateComment = async (mongoClient, coid, text) => {
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_comment_collection)
    .updateOne({ commentId: coid }, { $set: { text: text } });

  return result;
}

/**
 * 
 * @param {*} mongoClient 
 * @param {*} cid 
 * @returns 
 */
exports.deleteComment = async (mongoClient, cid) => {
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_comment_collection)
    .deleteOne({ commentId: cid });

  return result;
}