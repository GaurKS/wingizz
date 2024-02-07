const envConfig = require('../config/env.config');

exports.fetchSociety = async (mongoClient, societyId, societyEmail) => {
  const query = {};
  if (societyId) {
    query.societyId = societyId;
  }
  if (societyEmail) {
    query.societyEmail = societyEmail;
  }
  const society = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_society_collection)
    .findOne(query);
  return society;
}