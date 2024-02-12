const envConfig = require("../config/env.config")

exports.addInvitation = async (mongoClient, invite) => {
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_invitation_collection)
    .insertOne(invite)

  return result;
}