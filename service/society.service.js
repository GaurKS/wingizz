const envConfig = require("../config/env.config");
const AppException = require("../exception/app.exception");
const { generateUid } = require('../utils/generateUid');
const Society = require('../model/society.model');
const logger = require('../config/winston.config')
const { createSuccessResponse } = require('../utils/createResponse');
const Channel = require("../model/channel.model");
const { channelType, roles } = require("../utils/types.enum");
const { addSociety, modifySociety, deleteSociety } = require("../mongodb/society.mongo");
const { addChannel, modifyChannel, modifyChannelResource } = require("../mongodb/channel.mongo");
const { updateUser } = require("../mongodb/user.mongo");

// method to get society details
exports.getSociety = async (ctx) => {
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

// methods to add scoiety and its resources in society collection
// and create a channel for society and wing, also update root role to secretary
exports.createSociety = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const secretary = ctx.user.id;
  const { societyName, email, address, resource, wing } = ctx.request.body;
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

  const result = await addSociety(mongoClient, newSociety);
  await updateUser(mongoClient, secretary, { role: roles.S, address: { society: newSociety.societyId } });

  // add a society channel
  const newSocietyChannel = new Channel(
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
  const wingChannelPromises = newSociety.wing.map(async (wing) => {
    const newWingChannel = new Channel(
      wing.wingId,
      newSociety.societyId,
      channelType.WING,
      wing.wingName,
      [],
      [newSociety.secretary],
      [],
      wing.resources.map(r => r.resourceId),
      []
    )
    wingChannels.push(newWingChannel);
    return await addChannel(mongoClient, newWingChannel);
  });

  const wingChannelResult = await Promise.all(wingChannelPromises)
  const societyChannelResult = await addChannel(mongoClient, newSocietyChannel);

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

// method to add society or wing resource
exports.addResource = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const societyId = ctx.params.sid;
  const { resource, wingId } = ctx.request.body;
  const society = ctx.society;
  resource.forEach(r => r.resourceId = generateUid("rid_"));  // allocate id to every resource

  // if wingId is present, then add resource to wing else add resource to society
  if (wingId) {
    const wing = society.wing.find(w => w.wingId === wingId);
    if (!wing) {
      throw new AppException(`Wing not found. WingId: ${wingId}`, 'Wing not found.', 404);
    }
    wing.resources.push(...resource);
    const result = await modifySociety(mongoClient, society);
    if (!result) {
      throw new AppException(`Society updation failed. SocietyId: ${societyId}`, 'Society updation failed.', 500);
    }
    await modifyChannelResource(mongoClient, 'add', wingId, resource);
    ctx.status = 201;
    ctx.body = {
      message: 'Resource added successfully',
      society: society
    }
    return;
  }

  society.resource.push(...resource);
  const result = await modifySociety(mongoClient, society);
  if (!result) {
    throw new AppException(`Society updation failed. SocietyId: ${societyId}`, 'Society updation failed.', 500);
  }
  await modifyChannelResource(mongoClient, 'add', societyId, resource);

  ctx.status = 201;
  ctx.body = {
    message: 'Resource added successfully',
    society: society
  }
}

// method to remove society or wing resource
exports.removeResource = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const { sid, rid } = ctx.params;
  const society = ctx.society;

  // check the wing as well as society for the resource
  const wing = society.wing.find(w => w.resources.find(r => r.resourceId === rid));
  if (wing) {
    wing.resources = wing.resources.filter(r => r.resourceId !== rid);
    const result = await modifySociety(mongoClient, society);

    if (!result) {
      throw new AppException(`Society updation failed. SocietyId: ${sid} || ResourceId: ${rid}`, 'Society updation failed.', 500);
    }
    await modifyChannelResource(mongoClient, 'remove', wing.wingId, [{ resourceId: rid }]);

    ctx.status = 200;
    ctx.body = {
      message: 'Resource removed successfully',
      society: society
    }
    return;
  }
  society.resource = society.resource.filter(r => r.resourceId !== rid);
  const result = await modifySociety(mongoClient, society);
  console.log(result);

  if (!result || result.modifiedCount === 0) {
    throw new AppException(`Society updation failed. SocietyId: ${sid}`, 'Society updation failed.', 400);
  }
  await modifyChannelResource(mongoClient, 'remove', sid, [{ resourceId: rid }]);

  ctx.status = 200;
  ctx.body = {
    message: 'Resource removed successfully',
    society: society
  }
}

// method to delete society
exports.removeSociety = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const societyId = ctx.params.sid;
  const result = await deleteSociety(mongoClient, societyId);

  if (!result) {
    throw new AppException(`Society deletion failed. SocietyId: ${societyId}`, 'Society deletion failed.', 500);
  }

  ctx.status = 200;
  ctx.body = {
    message: 'Society deleted successfully'
  }
}
