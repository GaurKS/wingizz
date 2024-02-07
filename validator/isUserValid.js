const envConfig = require("../config/env.config");

const isUserEmailValid = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const { email } = ctx.request.body;

  const user = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_user_collection)
    .findOne({ email: email });

  if (!user) {
    return new Error(`Invalid email`)
  }

  return null;
}

const isUserTagValid = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const { userTag } = ctx.request.body;

  const user = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_user_collection)
    .findOne({ userTag: userTag });

  if (!user) {
    return new Error(`Invalid user tag`)
  }
  return null;
}

module.exports = {
  isUserEmailValid,
  isUserTagValid
}