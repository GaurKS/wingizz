const envConfig = require("../config/env.config")

/**
 * 
 * @param {*} mongoClient 
 * @param {*} cid 
 * @param {*} status 
 * @param {*} sort 
 * @param {*} limit 
 * @param {*} skip 
 * @returns 
 */
exports.fetchAllRequests = async (mongoClient, cid, status, sort = 1, limit = 5, skip = 0) => {
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_request_collection)
    .find({ channelId: cid, status: status })
    .sort({ createdAt: parseInt(sort) })
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .toArray();

  return result;
}

exports.fetchRequest = async (mongoClient, cid, rid) => {
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_request_collection)
    .findOne({ channelId: cid, requestId: rid })

  return result;
}

exports.createRequest = async (mongoClient, request) => {
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_request_collection)
    .insertOne(request);

  return result;
}