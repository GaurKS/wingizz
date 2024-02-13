const envConfig = require("../config/env.config");

exports.fetchComment = async (mongoClient, coid) => {
  const comment = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_comment_collection)
    .findOne({ commentId: coid })

  return comment;
}

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

exports.createComment = async (mongoClient, comment) => {
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_comment_collection)
    .insertOne(comment);

  return result;
}

exports.updateComment = async (mongoClient, coid, text) => {
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_comment_collection)
    .updateOne({ commentId: coid }, { $set: { text: text } });

  return result;
}

exports.deleteComment = async (mongoClient, cid) => {
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_comment_collection)
    .deleteOne({ commentId: cid });

  return result;
}