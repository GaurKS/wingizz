const envConfig = require("../config/env.config");

exports.fetchPost = async (mongoClient, pid) => {
  const post = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_post_collection)
    .findOne({ postId: pid })

  return post;
}

exports.fetchAllPosts = async (mongoClient, cid, sort, limit, skip) => {
  const posts = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_post_collection)
    .find({ channelId: cid })
    .sort({ createdAt: sort })
    .limit(limit)
    .skip(skip)
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