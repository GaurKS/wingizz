const { MongoClient, ServerApiVersion } = require('mongodb');
const envConfig = require('./env.config');
const logger = require('./winston.config');
const uri = envConfig.mongo_uri;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const dbInit = async () => {
  try {
    logger.info("Connecting to database...");
    await client.connect();
    logger.info("Database connected successfully");
  } catch (err) {
    logger.error('Error in database connection: ', err)
  }
}

const dbClient = () => {
  return client;
}

module.exports = { dbInit, dbClient };