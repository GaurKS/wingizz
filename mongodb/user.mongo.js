const envConfig = require('../config/env.config');

/**
 * 
 * @param {*} mongoClient 
 * @param {*} id 
 * @param {*} email 
 * @returns 
 */
exports.fetchUser = async (mongoClient, id, email) => {
  const query = {};
  if (id) {
    query.userTag = id;
  }
  if (email) {
    query.email = email;
  }

  const user = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_user_collection)
    .findOne(query)

  return user;
}


/**
 * 
 * @param {*} mongoClient 
 * @param {*} user 
 * @returns Promise
 */
exports.insertUser = async (mongoClient, user) => {
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_user_collection)
    .insertOne(user);

  return result;
}

/**
 * 
 * @param {*} mongoClient 
 * @param {*} user 
 * @returns 
 */
exports.updateUser = async (mongoClient, id, user) => {
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_user_collection)
    .updateOne({ userTag: id }, { $set: user });

  return result;
}