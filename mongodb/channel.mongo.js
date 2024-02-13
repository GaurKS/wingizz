const envConfig = require('../config/env.config');
const { roles, channelType } = require('../utils/types.enum');

/**
 * 
 * @param {*} mongoClient 
 * @param {*} channel 
 * @returns {Promise}
 */
exports.addChannel = async (mongoClient, channel) => {
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_channel_collection)
    .insertOne(channel);

  return result;
}

/**
 * 
 * @param {*} mongoClient 
 * @param {*} cid 
 * @returns 
 */
exports.fetchChannel = async (mongoClient, cid) => {
  const channel = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_channel_collection)
    .findOne({ channelId: cid });
  return channel;
}

/**
 * 
 * @param {*} mongoClient 
 * @param {*} sid 
 * @param {*} wid 
 * @returns 
 */
exports.fetchChannels = async (mongoClient, sid, wid) => {
  const query = {};
  if (wid) {
    query.wid = wid;
  }
  if (sid) {
    query.sid = sid;
  }
  const channels = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_channel_collection)
    .find(query)
    .toArray();

  return channels;
}

/**
 * 
 * @param {*} mongoClient 
 * @param {*} cid 
 * @param {*} uid 
 * @returns 
 */
exports.addChannelMember = async (mongoClient, cid, uid, role) => {
  if (role === roles.A) {
    const result = await mongoClient
      .db(envConfig.mongo_database)
      .collection(envConfig.mongo_channel_collection)
      .updateOne(
        { channelId: cid },
        { $push: { admins: uid } }
      );
    return result;
  }
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_channel_collection)
    .updateOne(
      { channelId: cid },
      { $push: { members: uid } }
    );
  return result;
}

exports.modifyChannelResource = async (mongoClient, action, channelId, resource) => {
  if (action === 'add') {
    const result = await mongoClient
      .db(envConfig.mongo_database)
      .collection(envConfig.mongo_channel_collection)
      .updateOne(
        { channelId: channelId },
        { $push: { resources: { $each: resource.map(r => r.resourceId) } } }
      );
    console.log(result);
    return result;
  }
  else if (action === 'remove') {
    const result = await mongoClient
      .db(envConfig.mongo_database)
      .collection(envConfig.mongo_channel_collection)
      .updateOne(
        { channelId: channelId },
        { $pull: { resources: { $in: resource.map(r => r.resourceId) } } }
      );
    return result;
  }
}