const envConfig = require("../config/env.config");
const AppException = require("../exception/app.exception");
const { generateUid } = require('../utils/generateUid');
const Society = require('../model/society.model');
const logger = require('../config/winston.config')

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

  if (result) {
    ctx.status = 201;
    ctx.body = {
      message: 'Society created successfully',
      society: newSociety
    };
    return;
  } else {
    throw new AppException(`Society creation failed. Email: ${email}', 'Society creation failed.`, 500)
  }
}

module.exports = {
  addSociety
}
