const envConfig = require("../config/env.config");

exports.fetchComment = async (mongoClient, cid) => {
  const comment = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_comment_collection)
    .findOne({ commentId: cid })

  return comment;
}

exports.createComment = async (mongoClient, comment) => {
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_comment_collection)
    .insertOne(comment);

  return result;
}

exports.updateComment = async (mongoClient, cid, text) => {
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_comment_collection)
    .updateOne({ commentId: cid }, { $set: { text: text } });

  return result;
}

exports.deleteComment = async (mongoClient, cid) => {
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_comment_collection)
    .deleteOne({ commentId: cid });

  return result;
}