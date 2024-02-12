const envConfig = require('../config/env.config');

/**
 * 
 * @param {*} mongoClient 
 * @param {*} societyId 
 * @param {*} societyEmail 
 * @param {*} secretaryId 
 * @returns {Promise}
 */
exports.fetchSociety = async (mongoClient, societyId, societyEmail, secretaryId) => {
  const query = {};
  if (societyId) {
    query.societyId = societyId;
  }
  if (societyEmail) {
    query.email = societyEmail;
  }
  if (secretaryId) {
    query.secretary = secretaryId;
  }

  const society = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_society_collection)
    .findOne(query)

  return society;
};

/**
 * 
 * @param {*} mongoClient 
 * @param {*} society 
 * @returns {Promise}
 */
exports.addSociety = async (mongoClient, society) => {
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_society_collection)
    .insertOne(society);

  return result;
}

/**
 * 
 * @param {*} mongoClient 
 * @param {*} society
 * @returns 
 */
exports.modifySociety = async (mongoClient, society) => {
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_society_collection)
    .updateOne({ societyId: society.societyId }, { $set: society });

  return result;
}

/**
 * 
 * @param {*} mongoClient 
 * @param {*} societyId 
 * @returns 
 */
exports.deleteSociety = async (mongoClient, societyId) => {
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_society_collection)
    .deleteOne({ societyId: societyId });

  return result;
}