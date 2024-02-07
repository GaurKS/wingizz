const envConfig = require("../config/env.config");
const AppException = require("../exception/app.exception");
const { generateUid } = require('../utils/generateUid');
const Society = require('../model/society.model');
const logger = require('../config/winston.config')
const { createSuccessResponse } = require('../utils/createResponse');
const Channel = require("../model/channel.model");
const { channelType } = require("../utils/types.enum");
const { fetchSociety } = require("../mongodb/society.mongo");

const getSociety = async (ctx) => {
  ctx.status = 200;
  ctx.body = createSuccessResponse(
    ctx.originalUrl,
    ctx.method,
    ctx.status,
    {
      message: 'Society found',
      society: ctx.society
    }
  )
}

// methods to add, edit, delete, get society
const addSociety = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const { societyName, email, address, secretary, resource, wing } = ctx.request.body;

  const society = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_society_collection)
    .findOne({ email: email, secretary: secretary });

  if (society) {
    throw new AppException(`Society already exists. Email: ${email}`, 'Society already exists.', 409)
  }

  // assign resourceId and wingId to resources and wings
  resource.forEach(r => r.resourceId = generateUid("rid_"));  // resourceId
  wing.forEach(w => w.wingId = generateUid("wid_"));  // wingId
  wing.forEach(w => w.resources.forEach(r => r.resourceId = generateUid("rid_")));  // resourceId

  const newSociety = new Society(
    generateUid("sid_"),
    societyName,
    email,
    address,
    secretary,
    resource,
    wing
  );

  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_society_collection)
    .insertOne(newSociety)

  // add a society channel
  const newSocietyChannel = new Channel(
    generateUid("cid_"),
    newSociety.societyId,
    null,
    channelType.SOCIETY,
    societyName,
    [],
    [newSociety.secretary],
    [],
    newSociety.resource.map(r => r.resourceId),
    []
  )

  const wingChannels = []

  // create a promise.all to create wing channels and return failed if any of the wing channel creation fails
  const wingChannelPromises = newSociety.wing.map(wing => {
    const newWingChannel = new Channel(
      generateUid("cid_"),
      newSociety.societyId,
      wing.wingId,
      channelType.WING,
      wing.wingName,
      [],
      [newSociety.secretary],
      [],
      wing.resources.map(r => r.resourceId),
      []
    )
    wingChannels.push(newWingChannel);
    return mongoClient
      .db(envConfig.mongo_database)
      .collection(envConfig.mongo_channel_collection)
      .insertOne(newWingChannel)
  })

  const wingChannelResult = await Promise.all(wingChannelPromises)
  const societyChannelResult = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_channel_collection)
    .insertOne(newSocietyChannel)

  // return successful channel ids
  if (societyChannelResult.insertedCount === 0 || wingChannelResult.some(r => r.insertedCount === 0)) {
    throw new AppException(`Channel creation failed. SocietyId: ${newSociety.societyId}`, 'Channel creation failed.', 500)
  }

  if (!result) {
    throw new AppException(`Society creation failed. Email: ${email}', 'Society creation failed.`, 500)
  }

  ctx.status = 201;
  ctx.body = createSuccessResponse(
    ctx.originalUrl,
    ctx.method,
    ctx.status,
    {
      message: 'Society created successfully',
      society: newSociety,
      channels: [
        newSocietyChannel,
        ...wingChannels
      ]
    }
  )
  return;
}

const addSocietyResource = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const societyId = ctx.params.sid;
  const { resource, wingId } = ctx.request.body;

  const society = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_society_collection)
    .findOne({ societyId: societyId });

  if (!society) {
    throw new AppException(`Society not found. SocietyId: ${societyId}`, 'Society not found.', 404);
  }

  // if wingId is present, then add resource to wing else add resource to society
  if (wingId) {
    const wing = society.wing.find(w => w.wingId === wingId);
    if (!wing) {
      throw new AppException(`Wing not found. WingId: ${wingId}`, 'Wing not found.', 404);
    }
    resource.forEach(r => r.resourceId = generateUid("rid_"));  // resourceId
    wing.resources.push(...resource);

    const result = await mongoClient
      .db(envConfig.mongo_database)
      .collection(envConfig.mongo_society_collection)
      .updateOne({ societyId: societyId }, { $set: society });

    if (!result) {
      throw new AppException(`Society updation failed. SocietyId: ${societyId}`, 'Society updation failed.', 500);
    }

    ctx.status
    ctx.body = {
      message: 'Resource added successfully',
      society: society
    }
    return;
  }

  resource.forEach(r => r.resourceId = generateUid("rid_"));  // resourceId
  society.resource.push(...resource);

  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_society_collection)
    .updateOne({ societyId: societyId }, { $set: society });

  if (!result) {
    throw new AppException(`Society updation failed. SocietyId: ${societyId}`, 'Society updation failed.', 500);
  }

  ctx.status = 200;
  ctx.body = {
    message: 'Resource added successfully',
    society: society
  }
}

const removeSocietyResource = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const { sid, rid } = ctx.params;

  const society = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_society_collection)
    .findOne({ society: sid });

  if (!society) {
    throw new AppException(`Society not found. SocietyId: ${sid}`, 'Society not found.', 404);
  }

  // check the wing as well as society for the resource
  const wing = society.wing.find(w => w.resources.find(r => r.resourceId === rid));
  if (wing) {
    wing.resources = wing.resources.filter(r => r.resourceId !== rid);

    const result = await mongoClient
      .db(envConfig.mongo_database)
      .collection(envConfig.mongo_society_collection)
      .updateOne({ societyId: sid }, { $set: society });

    if (!result) {
      throw new AppException(`Society updation failed. SocietyId: ${sid} || ResourceId: ${rid}`, 'Society updation failed.', 500);
    }

    ctx.status = 200;
    ctx.body = {
      message: 'Resource removed successfully',
      society: society
    }
    return;
  }

  society.resource = society.resource.filter(r => r.resourceId !== rid);

  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_society_collection)
    .updateOne({ society: sid }, { $set: society });

  if (!result) {
    throw new AppException(`Society updation failed. SocietyId: ${sid}`, 'Society updation failed.', 500);
  }
};

const removeSociety = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const societyId = ctx.params.sid;

  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_society_collection)
    .deleteOne({ societyId: societyId });

  if (!result) {
    throw new AppException(`Society deletion failed. SocietyId: ${societyId}`, 'Society deletion failed.', 500);
  }

  ctx.status = 200;
  ctx.body = {
    message: 'Society deleted successfully'
  }
}

module.exports = {
  getSociety,
  addSociety,
  addSocietyResource,
  removeSocietyResource,
  removeSociety,
};
